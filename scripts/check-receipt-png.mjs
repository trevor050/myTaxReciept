// Run after clicking Save image: node scripts/check-receipt-png.mjs receipt.png
// A restarted print animation shifts the paper up, leaving transparent rows below.
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import assert from 'node:assert/strict';

const png = readFileSync(process.argv[2]);
assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Not a PNG');
const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
assert.equal(png[24], 8, 'Expected 8-bit canvas PNG');
assert.equal(png[25], 6, 'Expected RGBA canvas PNG');
assert.equal(png[28], 0, 'Expected non-interlaced canvas PNG');
assert(width > 200 && height > 400 && width * height < 50_000_000, 'Unexpected receipt dimensions');
const chunks = [];
for (let offset = 8; offset < png.length;) {
  const size = png.readUInt32BE(offset);
  if (png.toString('ascii', offset + 4, offset + 8) === 'IDAT') chunks.push(png.subarray(offset + 8, offset + 8 + size));
  offset += size + 12;
}
const stride = width * 4;
// Optional browser-captured CSS rectangles, relative to the receipt, at pixelRatio 2.
const strikes = process.argv[3] ? JSON.parse(readFileSync(process.argv[3], 'utf8')).strikes.map((r) => ({
  left: Math.max(0, Math.floor(r.x * 2)), right: Math.min(width, Math.ceil((r.x + r.width) * 2)),
  top: Math.max(0, Math.floor(r.y * 2)), bottom: Math.min(height, Math.ceil((r.y + r.height) * 2)),
  columns: new Set(),
})) : [];
const raw = inflateSync(Buffer.concat(chunks), { maxOutputLength: (stride + 1) * height });
assert.equal(raw.length, (stride + 1) * height, 'Incomplete PNG pixels');
let previous = Buffer.alloc(stride);
const paeth = (a, b, c) => {
  const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
};
for (let y = 0; y < height; y++) {
  const filter = raw[y * (stride + 1)], row = Buffer.alloc(stride);
  assert(filter <= 4, 'Unknown PNG row filter');
  for (let x = 0; x < stride; x++) {
    const a = x >= 4 ? row[x - 4] : 0, b = previous[x], c = x >= 4 ? previous[x - 4] : 0;
    const prediction = [0, a, b, Math.floor((a + b) / 2), paeth(a, b, c)][filter];
    row[x] = (raw[y * (stride + 1) + 1 + x] + prediction) & 255;
  }
  // The torn edge occupies at most 14 physical pixels at pixelRatio 2.
  if (y === height - 40) {
    const center = Math.floor(width / 2) * 4;
    assert(row[center + 3] >= 250, 'Paper shifted up: transparent gap below receipt (print animation restarted)');
    assert(row[center] > 220 && row[center + 1] > 220 && row[center + 2] > 220, 'Receipt footer paper is clipped');
  }
  for (const r of strikes) if (y >= r.top && y < r.bottom) {
    for (let x = r.left; x < r.right; x++) {
      const i = x * 4;
      if (row[i] > 100 && row[i] > row[i + 1] * 1.5 && row[i] > row[i + 2] * 1.5 && row[i + 3] > 200) r.columns.add(x);
    }
  }
  previous = row;
}
for (const r of strikes) assert(r.columns.size / (r.right - r.left) >= 0.65, 'Incomplete red strike: pen animation restarted in export');
console.log(`Receipt PNG paper bounds OK: ${width} × ${height}. Also inspect fonts, marks and header visually.`);
