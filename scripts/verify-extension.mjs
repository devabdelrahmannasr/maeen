import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

const [browserName, browserBinary, driverBinary] = process.argv.slice(2);
if (!browserName || !browserBinary || !driverBinary) {
  throw new Error('Usage: node scripts/verify-extension.mjs <chrome|edge> <browser-binary> <driver-binary>');
}
if (!['chrome', 'edge'].includes(browserName)) {
  throw new Error('Browser name must be chrome or edge.');
}

const port = browserName === 'chrome' ? 9516 : 9517;
const webdriverBrowserName = browserName === 'edge' ? 'MicrosoftEdge' : 'chrome';
const optionsKey = browserName === 'edge' ? 'ms:edgeOptions' : 'goog:chromeOptions';
const cdpRoute = browserName === 'edge' ? 'ms/cdp/execute' : 'goog/cdp/execute';
const baseUrl = `http://127.0.0.1:${port}`;
const extensionPath = path.resolve('dist');
const profilePath = await mkdtemp(path.join(tmpdir(), `reading-helper-${browserName}-`));
await mkdir(path.resolve('output'), { recursive: true });

const driver = spawn(driverBinary, [`--port=${port}`], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true });
let driverLog = '';
let driverError;
driver.stdout.on('data', (chunk) => { driverLog += chunk; });
driver.stderr.on('data', (chunk) => { driverLog += chunk; });
driver.on('error', (error) => { driverError = error; });

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(`${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}.`);
  }
}

async function request(route, method = 'GET', body) {
  const response = await fetch(`${baseUrl}${route}`, {
    method,
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json();
  if (!response.ok || payload.value?.error) {
    throw new Error(`${method} ${route} failed: ${JSON.stringify(payload)}`);
  }
  return payload.value;
}

async function waitForDriver() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (driverError) {
      throw driverError;
    }
    try {
      await request('/status');
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error(`ChromeDriver did not start. ${driverLog}`);
}

async function execute(sessionId, script, args = []) {
  return request(`/session/${sessionId}/execute/sync`, 'POST', { script, args });
}

async function executeAsync(sessionId, script, args = []) {
  return request(`/session/${sessionId}/execute/async`, 'POST', { script, args });
}

async function screenshot(sessionId, fileName) {
  const imageBase64 = await request(`/session/${sessionId}/screenshot`);
  await writeFile(path.resolve(`output/${fileName}`), Buffer.from(imageBase64, 'base64'));
}

let sessionId;
try {
  await waitForDriver();
  const session = await request('/session', 'POST', {
    capabilities: {
      alwaysMatch: {
        browserName: webdriverBrowserName,
        [optionsKey]: {
          binary: browserBinary,
          args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
            `--user-data-dir=${profilePath}`,
            '--window-position=-32000,-32000',
            '--window-size=500,1000',
            '--no-first-run',
            '--no-default-browser-check',
          ],
        },
      },
    },
  });
  sessionId = session.sessionId;

  const targets = await request(`/session/${sessionId}/${cdpRoute}`, 'POST', {
    cmd: 'Target.getTargets',
    params: {},
  });
  const worker = targets.targetInfos.find(
    (target) => target.type === 'service_worker' && target.url.endsWith('/service-worker.js'),
  );
  if (!worker) {
    throw new Error(`Extension service worker was not loaded. Targets: ${JSON.stringify(targets.targetInfos)}`);
  }
  const extensionId = new URL(worker.url).host;
  const sidePanelUrl = `chrome-extension://${extensionId}/sidepanel.html`;

  const tabTarget = targets.targetInfos.find((target) => target.type === 'page');
  let actionTriggerResult = 'not-attempted';
  let sidePanelTargetOpened = false;
  if (tabTarget) {
    try {
      await request(`/session/${sessionId}/${cdpRoute}`, 'POST', {
        cmd: 'Extensions.triggerAction',
        params: { id: extensionId, targetId: tabTarget.targetId },
      });
      await new Promise((resolve) => setTimeout(resolve, 500));
      const targetsAfterAction = await request(`/session/${sessionId}/${cdpRoute}`, 'POST', {
        cmd: 'Target.getTargets',
        params: {},
      });
      sidePanelTargetOpened = targetsAfterAction.targetInfos.some((target) => target.url === sidePanelUrl);
      actionTriggerResult = 'accepted';
    } catch (error) {
      actionTriggerResult = error.message.includes('Method not allowed')
        ? 'blocked-by-webdriver-devtools-allowlist'
        : `failed: ${error.message}`;
    }
  }

  await request(`/session/${sessionId}/url`, 'POST', { url: sidePanelUrl });
  await executeAsync(sessionId, `
    const done = arguments[arguments.length - 1];
    chrome.storage.local.clear().then(() => done(true));
  `);
  await request(`/session/${sessionId}/refresh`, 'POST', {});
  await new Promise((resolve) => setTimeout(resolve, 500));
  const onboarding = await execute(sessionId, `
    return {
      direction: document.documentElement.dir,
      heading: document.querySelector('h1')?.textContent?.trim(),
      startButton: [...document.querySelectorAll('button')].find((button) => button.textContent.includes('ابدأ محليًا'))?.textContent?.trim(),
    };
  `);
  assertEqual(onboarding.direction, 'rtl', 'Document direction');
  assertEqual(onboarding.heading, 'اقرأ بهدف واضح', 'Onboarding heading');
  assertEqual(onboarding.startButton, 'ابدأ محليًا', 'Onboarding action');
  await screenshot(sessionId, `${browserName}-res004-onboarding.png`);

  await execute(sessionId, `
    const startButton = [...document.querySelectorAll('button')].find((button) => button.textContent.includes('ابدأ محليًا'));
    if (!startButton) throw new Error('Start button not found');
    startButton.click();
  `);
  await new Promise((resolve) => setTimeout(resolve, 300));
  const libraryHeading = await execute(sessionId, "return document.querySelector('h1')?.textContent?.trim();");
  const persistedState = await executeAsync(sessionId, `
    const done = arguments[arguments.length - 1];
    chrome.storage.local.get('onboardingComplete').then(done);
  `);
  await screenshot(sessionId, `${browserName}-res004-library.png`);

  await request(`/session/${sessionId}/refresh`, 'POST', {});
  await new Promise((resolve) => setTimeout(resolve, 300));
  const reloadedHeading = await execute(sessionId, "return document.querySelector('h1')?.textContent?.trim();");
  const sidePanelOptions = await executeAsync(sessionId, `
    const done = arguments[arguments.length - 1];
    chrome.sidePanel.getOptions({}).then(done);
  `);
  assertEqual(libraryHeading, 'مكتبتي', 'Library heading');
  assertEqual(persistedState.onboardingComplete, true, 'Onboarding persistence');
  assertEqual(reloadedHeading, 'مكتبتي', 'Reload recovery');
  assertEqual(sidePanelOptions.enabled, true, 'Side Panel enabled state');
  assertEqual(sidePanelOptions.path, 'sidepanel.html', 'Side Panel path');

  const result = {
    browserName,
    browserVersion: session.capabilities.browserVersion,
    driverVersion: (session.capabilities.chrome?.chromedriverVersion ?? session.capabilities['msedge.msedgedriverVersion'])?.split(' ')[0],
    extensionId,
    serviceWorkerLoaded: true,
    actionTriggerResult,
    sidePanelTargetOpened,
    onboarding,
    libraryHeading,
    persistedState,
    reloadedHeading,
    sidePanelOptions,
  };
  await writeFile(path.resolve(`output/${browserName}-res004-evidence.json`), `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
} finally {
  if (sessionId) {
    await request(`/session/${sessionId}`, 'DELETE').catch(() => {});
  }
  driver.kill();
  await rm(profilePath, { recursive: true, force: true });
}
