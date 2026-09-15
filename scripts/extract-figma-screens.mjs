import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const sourcePath = path.join(root, 'design/figma/reading-companion-ui.svg');
const outputDirectory = path.join(root, 'docs/release/store-assets');
const source = readFileSync(sourcePath, 'utf8');
const defs = source.match(/<defs>[\s\S]*?<\/defs>/)?.[0];

if (!defs) throw new Error('Figma source SVG is missing its shared definitions.');

const screens = [
  ['01 Onboarding', 'onboarding-320.svg', 40, 110],
  ['02 Library', 'library-420.svg', 530, 110],
  ['03 New Book', 'new-book-320.svg', 1020, 110],
  ['04 Goal', 'goal-420.svg', 1510, 110],
  ['05 Protocol', 'protocol-420.svg', 2000, 110],
  ['06 Focus', 'focus-600-dark.svg', 40, 910],
  ['07 Recall', 'recall-420.svg', 530, 910],
  ['08 Summary', 'summary-420.svg', 1020, 910],
  ['09 Progress', 'progress-600.svg', 1510, 910],
  ['10 Settings', 'settings-import-320.svg', 2000, 910],
];

function extractGroup(label, x, y) {
  const marker = `<!-- ${label} -->`;
  const markerStart = source.indexOf(marker);
  if (markerStart < 0) throw new Error(`Missing Figma screen marker: ${label}`);
  const groupStart = source.indexOf('<g transform="translate(', markerStart);
  let depth = 0;
  let cursor = groupStart;
  while (cursor < source.length) {
    const nextOpen = source.indexOf('<g', cursor);
    const nextClose = source.indexOf('</g>', cursor);
    if (nextClose < 0) throw new Error(`Unclosed Figma screen group: ${label}`);
    if (nextOpen >= 0 && nextOpen < nextClose) {
      depth += 1;
      cursor = nextOpen + 2;
    } else {
      depth -= 1;
      cursor = nextClose + 4;
      if (depth === 0) return source.slice(groupStart, cursor)
        .replace(`transform="translate(${x} ${y})"`, 'transform="translate(0 0)"');
    }
  }
  throw new Error(`Could not extract Figma screen group: ${label}`);
}

mkdirSync(outputDirectory, { recursive: true });
for (const [label, filename, x, y] of screens) {
  const group = extractGroup(label, x, y);
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="730" viewBox="0 0 420 730">',
    defs,
    group,
    '</svg>',
    '',
  ].join('\n');
  writeFileSync(path.join(outputDirectory, filename), svg);
}

console.log(`Extracted ${screens.length} Figma screens to ${path.relative(root, outputDirectory)}.`);
