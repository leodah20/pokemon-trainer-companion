import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { resolve } from 'path';

const SIZES = {
  'mdpi': 48, 'hdpi': 72, 'xhdpi': 96,
  'xxhdpi': 144, 'xxxhdpi': 192,
};

const BRAND_RED = '#CC0000';
const SURFACE = '#FFFFFF';
const DARK = '#1A1A2E';

function createIcon(size) {
  const r = size / 2;
  const centerR = r * 0.35;
  const centerR2 = centerR * 0.55;
  const stroke = Math.max(2, size * 0.015);

  const svg = `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"
       xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="c"> <circle cx="${r}" cy="${r}" r="${r}"/> </clipPath>
      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${BRAND_RED}"/>
        <stop offset="46%" stop-color="${BRAND_RED}"/>
        <stop offset="46%" stop-color="${SURFACE}"/>
        <stop offset="54%" stop-color="${SURFACE}"/>
        <stop offset="54%" stop-color="${SURFACE}"/>
        <stop offset="100%" stop-color="${SURFACE}"/>
      </linearGradient>
    </defs>
    <circle cx="${r}" cy="${r}" r="${r}" fill="url(#grad)" stroke="${DARK}" stroke-width="${stroke}"/>
    <rect x="0" y="${r * 0.46}" width="${size}" height="${size * 0.08}" fill="${DARK}"/>
    <circle cx="${r}" cy="${r}" r="${centerR}" fill="${SURFACE}" stroke="${DARK}" stroke-width="${stroke}"/>
    <circle cx="${r}" cy="${r}" r="${centerR2}" fill="${SURFACE}" stroke="${DARK}" stroke-width="${stroke * 0.8}"/>
  </svg>`;

  return Buffer.from(svg);
}

for (const [density, size] of Object.entries(SIZES)) {
  const dir = resolve(`android/app/src/main/res/mipmap-${density}`);
  mkdirSync(dir, { recursive: true });

  const svgBuf = createIcon(size);
  for (const name of ['ic_launcher', 'ic_launcher_round']) {
    await sharp(svgBuf).resize(size, size).png().toFile(resolve(dir, `${name}.png`));
    console.log(`${density}/${name}.png (${size}x${size})`);
  }
}

console.log('Done!');
