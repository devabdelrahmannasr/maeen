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
const runCoreFlow = process.argv.includes('--core');
const runTrueRestart = process.argv.includes('--true-restart');
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
  const sessionCapabilities = {
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
  };
  const session = await request('/session', 'POST', sessionCapabilities);
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
  await execute(sessionId, `
    window.__readingHelperVerification = { consoleErrors: [], networkRequests: [] };
    const verification = window.__readingHelperVerification;
    const originalConsoleError = console.error.bind(console);
    console.error = (...args) => { verification.consoleErrors.push(args.map(String).join(' ')); originalConsoleError(...args); };
    const originalFetch = window.fetch?.bind(window);
    if (originalFetch) window.fetch = (...args) => { verification.networkRequests.push(String(args[0])); return originalFetch(...args); };
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (...args) { verification.networkRequests.push(String(args[1])); return originalOpen.apply(this, args); };
  `);
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

  let coreFlow;
  if (runCoreFlow) {
    await execute(sessionId, `document.querySelector('a[href="#/books/new"]')?.click();`);
    await new Promise((resolve) => setTimeout(resolve, 250));
    await execute(sessionId, `
      const set = (selector, value) => { const input = document.querySelector(selector); if (!input) throw new Error('Missing '+selector); const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set; setter?.call(input, value); input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: value })); };
      set('input[required]:not([type="number"])', 'Core Flow Book');
      set('input[type="number"]', '20');
    `);
    await new Promise((resolve) => setTimeout(resolve, 200));
    await execute(sessionId, 'document.querySelector("form")?.requestSubmit();');
    await new Promise((resolve) => setTimeout(resolve, 500));
    const goals = await execute(sessionId, 'return { hash: location.hash, heading: document.querySelector("h1")?.textContent?.trim() };');
    assertEqual(goals.heading, 'لماذا تقرأ؟', 'Goal selection heading');
    await execute(sessionId, 'document.querySelector("form")?.requestSubmit();');
    await new Promise((resolve) => setTimeout(resolve, 700));
    const preview = await execute(sessionId, 'return { hash: location.hash, heading: document.querySelector("h1")?.textContent?.trim() };');
    assertEqual(preview.heading, 'طريقة القراءة', 'Protocol preview heading');
    await execute(sessionId, `
      const question = document.querySelector('textarea');
      if (question) { question.value = 'ما الفكرة الأساسية؟'; question.dispatchEvent(new Event('input', { bubbles: true })); }
      document.querySelector('form')?.requestSubmit();
    `);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const focus = await execute(sessionId, 'return { hash: location.hash, heading: document.querySelector("h1")?.textContent?.trim(), timer: document.querySelector(".timer-card strong")?.textContent?.trim() };');
    assertEqual(focus.heading, 'جلسة تركيز', 'Focus heading');
    const pauseButton = await execute(sessionId, 'return [...document.querySelectorAll("button")].find((button) => button.textContent.includes("إيقاف مؤقت")) !== undefined;');
    assertEqual(pauseButton, true, 'Pause action available');
    await execute(sessionId, '[...document.querySelectorAll("button")].find((button) => button.textContent.includes("إيقاف مؤقت"))?.click();');
    await new Promise((resolve) => setTimeout(resolve, 350));
    const paused = await execute(sessionId, 'return [...document.querySelectorAll("button")].find((button) => button.textContent.includes("استئناف القراءة")) !== undefined;');
    assertEqual(paused, true, 'Paused state');
    await execute(sessionId, '[...document.querySelectorAll("button")].find((button) => button.textContent.includes("استئناف القراءة"))?.click();');
    await new Promise((resolve) => setTimeout(resolve, 350));
    await execute(sessionId, 'location.hash = location.hash.replace("/focus", "/review");');
    await new Promise((resolve) => setTimeout(resolve, 400));
    await execute(sessionId, `
      const recall = document.querySelector('textarea');
      if (!recall) throw new Error('Recall input not found');
      recall.value = 'أتذكر الفكرة الرئيسية.';
      recall.dispatchEvent(new Event('input', { bubbles: true }));
    `);
    await new Promise((resolve) => setTimeout(resolve, 200));
    await execute(sessionId, 'document.querySelector("form")?.requestSubmit();');
    await new Promise((resolve) => setTimeout(resolve, 800));
    const summary = await execute(sessionId, 'return { hash: location.hash, heading: document.querySelector("h1")?.textContent?.trim(), saved: document.querySelector(".flow-card h2")?.textContent?.trim() };');
    assertEqual(summary.heading, 'ملخص الجلسة', 'Session summary heading');
    await executeAsync(sessionId, `
      const done = arguments[arguments.length - 1];
      const request = indexedDB.open('reading-helper-local', 1);
      request.onsuccess = () => {
        const database = request.result;
        const transaction = database.transaction('sessions', 'readwrite');
        transaction.objectStore('sessions').put({ schemaVersion: 1, id: 'interrupted-restart', planId: 'restart-plan', status: 'interrupted', currentStepId: 'read', lastSafeStatus: 'paused', updatedAt: new Date().toISOString() });
        transaction.oncomplete = () => { database.close(); done(true); };
        transaction.onerror = () => done(false);
      };
      request.onerror = () => done(false);
    `);
    let restart;
    if (browserName === 'edge') {
      await request(`/session/${sessionId}`, 'DELETE');
      sessionId = null;
      const restarted = await request('/session', 'POST', sessionCapabilities);
      sessionId = restarted.sessionId;
      await request(`/session/${sessionId}/url`, 'POST', { url: `${sidePanelUrl}#/library` });
      await new Promise((resolve) => setTimeout(resolve, 700));
      restart = await execute(sessionId, 'return { heading: document.querySelector("h1")?.textContent?.trim(), recovery: document.querySelector(".recovery-banner")?.textContent?.trim() };');
      assertEqual(restart.heading, 'مكتبتي', 'Restarted library heading');
      if (!restart.recovery?.includes('جلسة متوقفة بأمان')) throw new Error('Recovery banner was not restored after browser restart.');
    } else if (runTrueRestart) {
      await request(`/session/${sessionId}/${cdpRoute}`, 'POST', {
        cmd: 'Target.createTarget',
        params: { url: 'about:blank' },
      });
      await request(`/session/${sessionId}`, 'DELETE');
      sessionId = null;
      const restarted = await request('/session', 'POST', sessionCapabilities);
      sessionId = restarted.sessionId;
      await request(`/session/${sessionId}/url`, 'POST', { url: `${sidePanelUrl}#/library` });
      await new Promise((resolve) => setTimeout(resolve, 700));
      restart = await execute(sessionId, 'return { heading: document.querySelector("h1")?.textContent?.trim(), recovery: document.querySelector(".recovery-banner")?.textContent?.trim() };');
      assertEqual(restart.heading, 'مكتبتي', 'Restarted library heading');
      if (!restart.recovery?.includes('جلسة متوقفة بأمان')) throw new Error('Recovery banner was not restored after a true Chrome restart.');
    } else {
      await execute(sessionId, 'location.hash = "#/library";');
      await new Promise((resolve) => setTimeout(resolve, 250));
      await request(`/session/${sessionId}/refresh`, 'POST', {});
      await new Promise((resolve) => setTimeout(resolve, 700));
      restart = await execute(sessionId, 'return { heading: document.querySelector("h1")?.textContent?.trim(), recovery: document.querySelector(".recovery-banner")?.textContent?.trim(), limitation: "ChromeDriver cannot create a second session after closing this extension target" };');
      assertEqual(restart.heading, 'مكتبتي', 'Reloaded library heading');
    }
    await executeAsync(sessionId, `
      const done = arguments[arguments.length - 1];
      const request = indexedDB.open('reading-helper-local', 2);
      request.onupgradeneeded = () => {};
      request.onsuccess = () => { request.result.close(); done(true); };
      request.onerror = () => done(false);
    `);
    await request(`/session/${sessionId}/refresh`, 'POST', {});
    await new Promise((resolve) => setTimeout(resolve, 700));
    const migration = await execute(sessionId, 'return { heading: document.querySelector("h1")?.textContent?.trim(), banner: document.querySelector(".migration-banner")?.textContent?.trim(), exportAction: [...document.querySelectorAll("button")].some((button) => button.textContent.includes("صدّر نسخة احتياطية")) };');
    if (!migration.banner?.includes('وضع القراءة فقط')) throw new Error('Migration read-only banner was not shown for a future database version.');
    assertEqual(migration.exportAction, true, 'Migration export action');
    coreFlow = { goals, preview, focus, paused, summary, restart, migration };
  }

  const observability = await execute(sessionId, 'return window.__readingHelperVerification ?? { consoleErrors: [], networkRequests: [] };');
  assertEqual(observability.consoleErrors.length, 0, 'Extension console errors');
  assertEqual(observability.networkRequests.length, 0, 'Extension network requests');
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
    observability,
    ...(coreFlow ? { coreFlow } : {}),
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
