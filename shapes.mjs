// Usage: node shapes.mjs <AssetRipper export>/Assets/Resources/items sprite-data.json
import fs from 'fs'; import path from 'path'; import zlib from 'zlib';
const dir = process.argv[2], out = process.argv[3];
function decodePNG(buf) {
  let p = 8, w, h, idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString('ascii', p + 4, p + 8), data = buf.subarray(p + 8, p + 8 + len);
    if (type === 'IHDR') { w = data.readUInt32BE(0); h = data.readUInt32BE(4); if (data[8] !== 8 || data[9] !== 6) throw 'need RGBA8'; }
    if (type === 'IDAT') idat.push(data);
    p += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat)), bpp = 4, stride = w * bpp, px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0, b = y ? px[(y - 1) * stride + x] : 0, c = (x >= bpp && y) ? px[(y - 1) * stride + x - bpp] : 0;
      let v = src[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c); }
      px[y * stride + x] = v & 255;
    }
  }
  return { w, h, px };
}
const crcT = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0; }
const crc = b => { let c = ~0; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (~c) >>> 0; };
function chunk(t, d) { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); }
function encodePNG(w, h, px) {
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w); ih.writeUInt32BE(h, 4); ih[8] = 8; ih[9] = 6;
  const raw = Buffer.alloc(h * (w * 4 + 1)); for (let y = 0; y < h; y++) px.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
const atlas = decodePNG(fs.readFileSync(path.join(dir, 'items_module.png')));
const texId = JSON.parse(fs.readFileSync(path.join(dir, 'module_red_t.json'))).m_RD.m_Texture.m_PathID;
const G = 16, res = {};
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.json'))) {
  let j; try { j = JSON.parse(fs.readFileSync(path.join(dir, f))); } catch { continue; }
  if (!j.m_RD || j.m_RD.m_Texture.m_PathID !== texId) continue;
  const r = j.m_Rect, W = Math.max(1, r.m_Width / G | 0), H = Math.max(1, r.m_Height / G | 0);
  // Unity y is bottom-up; PNG rows are top-down. Shape row 0 = top of sprite.
  const top = atlas.h - (r.m_Y + r.m_Height);
  const cells = [];
  for (let i = 0; i < H; i++) { let row = ''; for (let k = 0; k < W; k++) {
    let any = 0; for (let y = 0; y < G && !any; y++) for (let x = 0; x < G; x++) { const py = top + i * G + y, pxx = r.m_X + k * G + x; if (atlas.px[(py * atlas.w + pxx) * 4 + 3] > 0) { any = 1; break; } }
    row += any ? '1' : '0'; } cells.push(row); }
  // Geometry only, no pixels: the cell shape plus where the sprite sits in the atlas (top-left origin).
  // The page cuts the icons out of a user-supplied items_module.png at these rectangles.
  res[j.m_Name] = { shape: cells, rect: [r.m_X, top, r.m_Width, r.m_Height] };
}
res._atlas = { w: atlas.w, h: atlas.h };
fs.writeFileSync(out, JSON.stringify(res));
for (const [k, v] of Object.entries(res).sort()) if (v.shape) console.log(k.padEnd(28), v.shape.join('/'));
