import fs from 'node:fs';
import zlib from 'node:zlib';

function createPng(width, height, r, g, b) {
  // Minimal uncompressed PNG generator
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth
  ihdrData.writeUInt8(2, 9); // color type (truecolor RGB)
  ihdrData.writeUInt8(0, 10); // compression
  ihdrData.writeUInt8(0, 11); // filter
  ihdrData.writeUInt8(0, 12); // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image data with scanline filter byte 0
  const scanlineLength = 1 + width * 3;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      // create subtle industrial gradient & border
      const isBorder = (x < 6 || x >= width - 6 || y < 6 || y >= height - 6);
      const isCenterBox = Math.abs(x - width/2) < width * 0.25 && Math.abs(y - height/2) < height * 0.25;
      
      if (isBorder) {
        rawData[pixelOffset] = 59; // Slate-700
        rawData[pixelOffset + 1] = 130;
        rawData[pixelOffset + 2] = 246;
      } else if (isCenterBox) {
        rawData[pixelOffset] = 37; // Royal Blue
        rawData[pixelOffset + 1] = 99;
        rawData[pixelOffset + 2] = 235;
      } else {
        const factor = y / height;
        rawData[pixelOffset] = Math.round(15 + factor * 15);
        rawData[pixelOffset + 1] = Math.round(23 + factor * 18);
        rawData[pixelOffset + 2] = Math.round(42 + factor * 17);
      }
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = crc32(Buffer.concat([typeBuf, data]));
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xff];
  }
  return (c ^ 0xffffffff) >>> 0;
}

const table = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    if (c & 1) c = 0xedb88320 ^ (c >>> 1);
    else c = c >>> 1;
  }
  table[n] = c;
}

fs.mkdirSync('public', { recursive: true });
fs.writeFileSync('public/pwa-192x192.png', createPng(192, 192, 15, 23, 42));
fs.writeFileSync('public/pwa-512x512.png', createPng(512, 512, 15, 23, 42));
fs.writeFileSync('public/pwa-maskable-512x512.png', createPng(512, 512, 30, 41, 59));
fs.writeFileSync('public/apple-touch-icon.png', createPng(180, 180, 15, 23, 42));
console.log('PNG Icons successfully generated!');
