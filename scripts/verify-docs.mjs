import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => readFileSync(path.join(root, relativePath), 'utf8');
const manifest = JSON.parse(read('public/manifest.json'));
const packageJson = JSON.parse(read('package.json'));
const README = read('README.md');
const privacy = read('docs/architecture/PRIVACY_SECURITY.md');
const changelog = read('CHANGELOG.md');
const storeListing = read('docs/release/store-listing.md');
const readPngDimensions = (relativePath) => {
  const bytes = readFileSync(path.join(root, relativePath));
  if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
    throw new Error(`Release screenshot is not a PNG: ${relativePath}`);
  }
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
};
if (!existsSync(path.join(root, 'LICENSE')) || !read('LICENSE').includes('MIT License')) throw new Error('MIT license contract failed');
if (!README.includes('MIT') || !README.includes('never reads, parses, uploads, or transmits PDF content')) throw new Error('README privacy/license contract failed');
if (JSON.stringify(manifest.permissions) !== JSON.stringify(['sidePanel', 'storage', 'activeTab'])) throw new Error('Manifest permission contract failed');
if (!privacy.includes('sidePanel') || !changelog.includes(`## ${packageJson.version}`)) throw new Error('Privacy/version contract failed');
if (!storeListing.includes('draft/unpublished') || !storeListing.includes('must not claim capabilities outside')) throw new Error('Store listing contract failed');
const assets = JSON.parse(read('docs/release/assets-manifest.json'));
for (const asset of assets.brandAssets ?? []) {
  if (!existsSync(path.join(root, asset.path))) throw new Error(`Missing brand asset: ${asset.path}`);
}
for (const asset of [...assets.icons, ...assets.screenshots]) {
  if (!existsSync(path.join(root, asset.path))) throw new Error(`Missing release asset: ${asset.path}`);
}
for (const asset of assets.screenshots) {
  if (!asset.path.endsWith('.png')) throw new Error(`Marketplace screenshot must be PNG: ${asset.path}`);
  if (asset.sourceSvg) throw new Error(`Marketplace screenshot must not reference SVG: ${asset.path}`);
  const dimensions = readPngDimensions(asset.path);
  if (dimensions.width !== asset.width || dimensions.height !== asset.height) {
    throw new Error(`Screenshot dimensions disagree for ${asset.path}: manifest ${asset.width}x${asset.height}, file ${dimensions.width}x${dimensions.height}`);
  }
}
for (const assetPath of Object.values(manifest.icons ?? {})) {
  if (!existsSync(path.join(root, 'public', assetPath))) throw new Error(`Missing manifest icon: ${assetPath}`);
}
console.log('Documentation and asset contract passed.');
