/**
 * formatEncoders.ts
 * High-performance client-side image encoders for BMP, ICO, and TIFF formats,
 * enabling full format-to-format conversion completely inside the browser.
 */

/**
 * Encodes an HTMLCanvasElement into a valid 24-bit uncompressed BMP image Blob.
 */
export function canvasToBmpBlob(canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not access 2D canvas context');

  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // BMP rows must be padded to multiples of 4 bytes
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileHeaderSize = 14;
  const dibHeaderSize = 40;
  const fileSize = fileHeaderSize + dibHeaderSize + pixelArraySize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // 1. BMP Header (14 bytes)
  view.setUint16(0, 0x4d42, false); // Signature: 'BM'
  view.setUint32(2, fileSize, true); // Total file size
  view.setUint32(6, 0, true); // Reserved
  view.setUint32(10, fileHeaderSize + dibHeaderSize, true); // Offset to pixel data (54)

  // 2. DIB Header: BITMAPINFOHEADER (40 bytes)
  view.setUint32(14, dibHeaderSize, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true); // Positive height = bottom-to-top pixel storage
  view.setUint16(26, 1, true); // Color planes
  view.setUint16(28, 24, true); // 24 bits per pixel (BGR)
  view.setUint32(30, 0, true); // Compression = BI_RGB (uncompressed)
  view.setUint32(34, pixelArraySize, true);
  view.setInt32(38, 2835, true); // 72 DPI horizontal (pixels/meter)
  view.setInt32(42, 2835, true); // 72 DPI vertical
  view.setUint32(46, 0, true); // Palette colors
  view.setUint32(50, 0, true); // Important colors

  // 3. Pixel Array (BGR, bottom-up)
  let offset = fileHeaderSize + dibHeaderSize;
  const padding = rowSize - width * 3;

  for (let y = height - 1; y >= 0; y--) {
    for (let x = 0; x < width; x++) {
      const srcIdx = (y * width + x) * 4;
      const r = data[srcIdx];
      const g = data[srcIdx + 1];
      const b = data[srcIdx + 2];
      const a = data[srcIdx + 3];

      // Alpha blend onto white background if transparent
      let finalR = r;
      let finalG = g;
      let finalB = b;
      if (a < 255) {
        const alpha = a / 255;
        finalR = Math.round(r * alpha + 255 * (1 - alpha));
        finalG = Math.round(g * alpha + 255 * (1 - alpha));
        finalB = Math.round(b * alpha + 255 * (1 - alpha));
      }

      view.setUint8(offset++, finalB);
      view.setUint8(offset++, finalG);
      view.setUint8(offset++, finalR);
    }
    for (let p = 0; p < padding; p++) {
      view.setUint8(offset++, 0);
    }
  }

  return new Blob([buffer], { type: 'image/bmp' });
}

/**
 * Encodes an HTMLCanvasElement into a valid Microsoft Icon (.ICO) Blob.
 * Uses PNG compression inside the ICO container, standard across modern Windows and all web browsers.
 */
export async function canvasToIcoBlob(
  canvas: HTMLCanvasElement,
  preferredSize: number = 64
): Promise<Blob> {
  const targetSize = Math.min(256, Math.max(16, preferredSize));
  const icoCanvas = document.createElement('canvas');
  icoCanvas.width = targetSize;
  icoCanvas.height = targetSize;
  const ctx = icoCanvas.getContext('2d');
  if (ctx) {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(canvas, 0, 0, targetSize, targetSize);
  }

  const pngBlob = await new Promise<Blob>((resolve, reject) => {
    icoCanvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Failed to generate PNG frame for ICO'));
    }, 'image/png');
  });

  const pngBuffer = await pngBlob.arrayBuffer();
  const icoHeaderSize = 6;
  const dirEntrySize = 16;
  const totalSize = icoHeaderSize + dirEntrySize + pngBuffer.byteLength;
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // ICONDIR Header
  view.setUint16(0, 0, true); // Reserved
  view.setUint16(2, 1, true); // Type: 1 = Icon (.ICO)
  view.setUint16(4, 1, true); // Image count = 1

  // ICONDIRENTRY
  const w = targetSize >= 256 ? 0 : targetSize;
  const h = targetSize >= 256 ? 0 : targetSize;
  view.setUint8(6, w); // Width (0 means 256)
  view.setUint8(7, h); // Height (0 means 256)
  view.setUint8(8, 0); // Color palette
  view.setUint8(9, 0); // Reserved
  view.setUint16(10, 1, true); // Color planes
  view.setUint16(12, 32, true); // Bits per pixel
  view.setUint32(14, pngBuffer.byteLength, true); // Image data size in bytes
  view.setUint32(18, icoHeaderSize + dirEntrySize, true); // Offset to image data

  // Write PNG stream
  const uint8 = new Uint8Array(buffer);
  uint8.set(new Uint8Array(pngBuffer), icoHeaderSize + dirEntrySize);

  return new Blob([buffer], { type: 'image/x-icon' });
}

/**
 * Encodes an HTMLCanvasElement into a standard baseline TIFF 6.0 Blob (RGBA uncompressed).
 */
export function canvasToTiffBlob(canvas: HTMLCanvasElement): Blob {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not access 2D context');

  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const numDirectoryEntries = 11;
  const headerSize = 8;
  const ifdSize = 2 + numDirectoryEntries * 12 + 4;
  const bitsPerSampleOffset = headerSize + ifdSize;
  const bitsPerSampleSize = 8; // 4 * 2 bytes for RGBA
  const stripOffset = bitsPerSampleOffset + bitsPerSampleSize;
  const stripByteCount = width * height * 4;
  const totalSize = stripOffset + stripByteCount;

  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);

  // TIFF Header (Little-Endian 'II')
  view.setUint16(0, 0x4949, true); // 'II'
  view.setUint16(2, 42, true); // Magic 42
  view.setUint32(4, 8, true); // Offset to first IFD

  // Number of IFD directory entries
  view.setUint16(8, numDirectoryEntries, true);

  let tagPos = 10;
  const writeTag = (tag: number, type: number, count: number, value: number) => {
    view.setUint16(tagPos, tag, true);
    view.setUint16(tagPos + 2, type, true);
    view.setUint32(tagPos + 4, count, true);
    view.setUint32(tagPos + 8, value, true);
    tagPos += 12;
  };

  // IFD tags must be written in ascending order of tag ID:
  writeTag(256, 4, 1, width); // 256: ImageWidth (LONG)
  writeTag(257, 4, 1, height); // 257: ImageLength (LONG)
  writeTag(258, 3, 4, bitsPerSampleOffset); // 258: BitsPerSample (SHORT[4])
  writeTag(259, 3, 1, 1); // 259: Compression (1 = uncompressed)
  writeTag(262, 3, 1, 2); // 262: PhotometricInterpretation (2 = RGB)
  writeTag(273, 4, 1, stripOffset); // 273: StripOffsets (LONG)
  writeTag(277, 3, 1, 4); // 277: SamplesPerPixel (4 = RGBA)
  writeTag(278, 4, 1, height); // 278: RowsPerStrip (LONG)
  writeTag(279, 4, 1, stripByteCount); // 279: StripByteCounts (LONG)
  writeTag(284, 3, 1, 1); // 284: PlanarConfiguration (1 = chunky)
  writeTag(338, 3, 1, 1); // 338: ExtraSamples (1 = associated alpha)

  view.setUint32(tagPos, 0, true); // Next IFD offset = 0

  // Write BitsPerSample: 8, 8, 8, 8
  view.setUint16(bitsPerSampleOffset, 8, true);
  view.setUint16(bitsPerSampleOffset + 2, 8, true);
  view.setUint16(bitsPerSampleOffset + 4, 8, true);
  view.setUint16(bitsPerSampleOffset + 6, 8, true);

  // Write pixel strip data
  const uint8 = new Uint8Array(buffer, stripOffset, stripByteCount);
  uint8.set(data);

  return new Blob([buffer], { type: 'image/tiff' });
}
