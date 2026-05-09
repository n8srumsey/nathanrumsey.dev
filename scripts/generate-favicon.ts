import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import sharp from 'sharp';
import { FAVICON_VIEWBOX, faviconShapes, faviconStyles } from '../src/utils/favicon.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '../public');

function buildSvg(): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${FAVICON_VIEWBOX}">
  ${faviconStyles()}
  ${faviconShapes()}
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

mkdirSync(publicDir, { recursive: true });

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
