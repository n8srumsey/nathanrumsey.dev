import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '../public');

// Color tokens — keep in sync with src/styles/global.css
const DARK = {
  frame: 'hsl(220 13% 18%)',
  screen: 'hsl(207 35% 8%)',
  primary: 'hsl(162 68% 44%)',
};
const LIGHT = {
  frame: '#4b5563',
  screen: '#1e293b',
};

function buildSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <style>
    .frame { fill: ${DARK.frame}; }
    .screen { fill: ${DARK.screen}; }
    .monogram { fill: ${DARK.primary}; }
    .keyline { fill: ${DARK.screen}; }
    @media (prefers-color-scheme: light) {
      .frame { fill: ${LIGHT.frame}; }
      .screen { fill: ${LIGHT.screen}; }
      .keyline { fill: ${LIGHT.screen}; }
    }
  </style>
  <!-- Monitor bezel -->
  <rect class="frame" x="4" y="4" width="120" height="82" rx="7"/>
  <!-- Screen -->
  <rect class="screen" x="12" y="12" width="104" height="66"/>
  <!-- NR monogram -->
  <text class="monogram" x="64" y="45" text-anchor="middle" dominant-baseline="middle"
        font-family="'Courier New', Courier, monospace" font-weight="700" font-size="44">NR</text>
  <!-- Stand -->
  <rect class="frame" x="60" y="86" width="8" height="14"/>
  <!-- Base -->
  <rect class="frame" x="36" y="99" width="56" height="7" rx="3"/>
  <!-- Keyboard -->
  <rect class="frame" x="12" y="109" width="104" height="16" rx="5"/>
  <!-- Key rows -->
  <rect class="keyline" x="18" y="112" width="92" height="3" rx="1"/>
  <rect class="keyline" x="18" y="117" width="92" height="3" rx="1"/>
  <rect class="keyline" x="22" y="122" width="84" height="2" rx="1"/>
</svg>`;
}

function buildIco(pngBuffers: Buffer[], sizes: number[]): Buffer {
  const count = pngBuffers.length;
  const headerSize = 6;
  const entrySize = 16;
  const directorySize = headerSize + count * entrySize;

  const offsets: number[] = [];
  let offset = directorySize;
  for (const png of pngBuffers) {
    offsets.push(offset);
    offset += png.length;
  }

  const buffer = Buffer.alloc(offset);
  buffer.writeUInt16LE(0, 0);
  buffer.writeUInt16LE(1, 2);
  buffer.writeUInt16LE(count, 4);

  for (let i = 0; i < count; i++) {
    const size = sizes[i] as number;
    const base = headerSize + i * entrySize;
    buffer.writeUInt8(size >= 256 ? 0 : size, base);
    buffer.writeUInt8(size >= 256 ? 0 : size, base + 1);
    buffer.writeUInt8(0, base + 2);
    buffer.writeUInt8(0, base + 3);
    buffer.writeUInt16LE(1, base + 4);
    buffer.writeUInt16LE(32, base + 6);
    buffer.writeUInt32LE((pngBuffers[i] as Buffer).length, base + 8);
    buffer.writeUInt32LE(offsets[i] as number, base + 12);
  }

  let pos = directorySize;
  for (const png of pngBuffers) {
    png.copy(buffer, pos);
    pos += png.length;
  }

  return buffer;
}

const svg = buildSvg();
writeFileSync(join(publicDir, 'favicon.svg'), svg);
console.log('  favicon.svg');

const sizes: number[] = [16, 32];
const pngs = await Promise.all(
  sizes.map(size =>
    sharp(Buffer.from(svg))
      .resize(size, size)
      .png()
      .toBuffer()
  )
);

writeFileSync(join(publicDir, 'favicon.ico'), buildIco(pngs, sizes));
console.log('  favicon.ico');
