import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, utimesSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const npmCommand = process.platform === 'win32' ? 'npm' : 'npm';
const outputRoot = path.join(root, 'output', 'release');
const distRoot = path.join(root, 'dist');
const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(path.join(root, 'public', 'manifest.json'), 'utf8'));

function run(command, args, options = {}) {
  execFileSync(command, args, { cwd: root, stdio: 'inherit', windowsHide: true, ...options });
}

function runNpm(args, encoding) {
  if (process.platform === 'win32') {
    const command = `npm ${args.join(' ')}`;
    return execFileSync('cmd.exe', ['/d', '/s', '/c', command], { cwd: root, stdio: encoding ? 'pipe' : 'inherit', encoding, windowsHide: true });
  }
  return execFileSync(npmCommand, args, { cwd: root, stdio: encoding ? 'pipe' : 'inherit', encoding, windowsHide: true });
}

function sha256(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function filesUnder(directory, prefix = '') {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const relative = path.join(prefix, entry.name);
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(absolute, relative) : [relative];
  }).sort();
}

function distManifest() {
  return filesUnder(distRoot).map((relativePath) => ({
    path: relativePath.replaceAll(path.sep, '/'),
    sha256: sha256(path.join(distRoot, relativePath)),
    bytes: statSync(path.join(distRoot, relativePath)).size,
  }));
}

const reproducibleTimestamp = new Date('2000-01-01T00:00:00.000Z');

function normalizeTreeTimestamps(directory) {
  utimesSync(directory, reproducibleTimestamp, reproducibleTimestamp);
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) normalizeTreeTimestamps(absolute);
    else utimesSync(absolute, reproducibleTimestamp, reproducibleTimestamp);
  }
}

if (process.version !== 'v24.19.0') throw new Error(`Node 24.19.0 required; found ${process.version}`);
const npmVersion = runNpm(['--version'], 'utf8').trim();
if (npmVersion !== '11.17.0') throw new Error(`npm 11.17.0 required; found ${npmVersion}`);

for (const required of ['LICENSE', 'README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'CHANGELOG.md', 'docs/release/store-listing.md', 'docs/release/assets-manifest.json']) {
  if (!existsSync(path.join(root, required))) throw new Error(`Missing release file: ${required}`);
}
if (JSON.stringify(manifest.permissions) !== JSON.stringify(['sidePanel', 'storage', 'activeTab'])) throw new Error('Manifest permission drift detected');
if (manifest.host_permissions || manifest.optional_host_permissions || manifest.content_scripts || manifest.scripting || manifest.tabs || manifest.webRequest) throw new Error('Broad manifest access detected');
for (const relativePath of Object.values(manifest.icons ?? {})) {
  if (!existsSync(path.join(root, 'public', relativePath))) throw new Error(`Missing manifest icon: ${relativePath}`);
}
const storeListing = readFileSync(path.join(root, 'docs/release/store-listing.md'), 'utf8');
const descriptiveListing = storeListing.split('This draft must not claim')[0];
if (/PDF parsing|cloud sync|\bAI\b|AI\/RAG/i.test(descriptiveListing)) throw new Error('Unsupported store claim detected');

runNpm(['run', 'check']);
run(process.execPath, ['scripts/verify-docs.mjs']);
rmSync(outputRoot, { recursive: true, force: true });
mkdirSync(outputRoot, { recursive: true });
const first = distManifest();
const archivePath = path.join(outputRoot, `${packageJson.name}-${packageJson.version}.zip`);
const archiveName = path.basename(archivePath);
function packageDist(targetPath) {
  normalizeTreeTimestamps(distRoot);
  if (process.platform === 'win32') {
    const command = `$ErrorActionPreference='Stop'; Compress-Archive -Path '${path.join(distRoot, '*')}' -DestinationPath '${targetPath}' -Force`;
    run('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', command]);
  } else {
    const relativeFiles = filesUnder(distRoot);
    run('zip', ['-q', '-X', targetPath, ...relativeFiles], { cwd: distRoot });
  }
}
packageDist(archivePath);
const firstPackageHash = sha256(archivePath);
runNpm(['run', 'build']);
const second = distManifest();
if (JSON.stringify(first) !== JSON.stringify(second)) throw new Error('Dist output is not reproducible');
const repeatArchivePath = path.join(outputRoot, `${packageJson.name}-${packageJson.version}.repeat.zip`);
packageDist(repeatArchivePath);
const repeatPackageHash = sha256(repeatArchivePath);
if (firstPackageHash !== repeatPackageHash) throw new Error('Package output is not reproducible');
rmSync(archivePath, { force: true });
renameSync(repeatArchivePath, archivePath);
if (!existsSync(archivePath)) throw new Error(`Package was not created: ${archivePath}`);
writeFileSync(path.join(outputRoot, 'artifact-manifest.json'), JSON.stringify({
  version: packageJson.version,
  node: process.version,
  npm: npmVersion,
  files: second,
  package: { path: path.relative(root, archivePath).replaceAll(path.sep, '/'), sha256: sha256(archivePath) },
}, null, 2) + '\n');
writeFileSync(path.join(outputRoot, 'package.sha256'), `${sha256(archivePath)}  ${archiveName}\n`);
console.log(`Release verification passed. Artifact: ${path.relative(root, archivePath)}`);
