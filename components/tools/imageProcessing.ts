export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  sizeBytes: number;
  fileName: string;
  aspectRatio: number;
}

export interface ResizeOptions {
  targetWidth: number;
  targetHeight: number;
  maintainAspectRatio: boolean;
  fitMode: 'fit' | 'fill' | 'cover' | 'contain'; // fit/contain = letterbox/pad, fill = stretch, cover = center crop
  backgroundColor: string; // '#FFFFFF' | 'transparent' | custom
  targetKb?: number | null;
  maxKbLimit?: boolean;
  outputFormat: 'image/jpeg' | 'image/png' | 'image/webp';
  quality: number; // 0.1 to 1.0
  rotation: number; // 0, 90, 180, 270
  trimSignatureBorders?: boolean;
  enhanceSignatureContrast?: boolean;
  enhanceContrast?: boolean;
  contrastLevel?: number;
  autoScaleIfOverTargetKb?: boolean;
}

export interface ProcessResult {
  blob: Blob;
  dataUrl: string;
  blobUrl: string; // alias
  width: number;
  height: number;
  sizeBytes: number;
  format: string;
  outputWidth: number;
  outputHeight: number;
  outputSizeBytes: number;
  outputFormat: string;
  compressionRatio: number;
  achievedTargetKb: boolean;
  actualQualityUsed: number;
  dimensionsScaled: boolean;
}

export type ProcessedImageResult = ProcessResult;

/**
 * Trims excess whitespace or transparency around a signature
 */
export function autoTrimCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  let foundInk = false;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];

      // Detect ink pixel: non-transparent and darker than light background
      const isTransparent = a < 40;
      const isWhitePaper = r > 240 && g > 240 && b > 240;

      if (!isTransparent && !isWhitePaper) {
        foundInk = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  // If no distinct ink detected, return original
  if (!foundInk || minX >= maxX || minY >= maxY) {
    return canvas;
  }

  // Add 4% padding around signature
  const padX = Math.round((maxX - minX) * 0.04);
  const padY = Math.round((maxY - minY) * 0.04);

  const cropX = Math.max(0, minX - padX);
  const cropY = Math.max(0, minY - padY);
  const cropW = Math.min(width - cropX, maxX - minX + padX * 2);
  const cropH = Math.min(height - cropY, maxY - minY + padY * 2);

  const trimmedCanvas = document.createElement('canvas');
  trimmedCanvas.width = cropW;
  trimmedCanvas.height = cropH;
  const trimmedCtx = trimmedCanvas.getContext('2d');
  if (!trimmedCtx) return canvas;

  trimmedCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
  return trimmedCanvas;
}

/**
 * Clean up signature paper: turns light grayish background to pure white while preserving dark ink
 */
export function enhanceSignatureCanvas(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const width = canvas.width;
  const height = canvas.height;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a < 30) continue;

    // Luminance calculation
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;

    // If pixel is near-white (background paper), snap to pure white
    if (lum > 215) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    } else {
      // Darken ink for high contrast
      const factor = Math.max(0, lum - 30) / lum;
      data[i] = Math.max(0, Math.round(r * factor));
      data[i + 1] = Math.max(0, Math.round(g * factor));
      data[i + 2] = Math.max(0, Math.round(b * factor));
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

/**
 * Creates a canvas with rotation and scaling applied
 */
function createTransformedCanvas(
  source: HTMLImageElement | HTMLCanvasElement,
  rotation: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const rot = (rotation % 360 + 360) % 360;

  if (rot === 90 || rot === 270) {
    canvas.width = source.height;
    canvas.height = source.width;
  } else {
    canvas.width = source.width;
    canvas.height = source.height;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rot * Math.PI) / 180);
  ctx.drawImage(source, -source.width / 2, -source.height / 2);
  ctx.restore();

  return canvas;
}

/**
 * Load HTMLImageElement from File or returns existing HTMLImageElement
 */
export function loadImageElement(source: HTMLImageElement | File): Promise<HTMLImageElement> {
  if (source instanceof HTMLImageElement) {
    return Promise.resolve(source);
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(source);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image file.'));
    };
    img.src = url;
  });
}

/**
 * Read image dimensions and metadata safely
 */
export async function readImageMetadata(file: File): Promise<ImageMetadata> {
  const img = await loadImageElement(file);
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  return {
    width,
    height,
    format: file.type || 'image/jpeg',
    sizeBytes: file.size,
    fileName: file.name,
    aspectRatio: width / height,
  };
}

/**
 * Helper to download blob with given filename
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Core image processing function with binary search KB compression
 */
export async function processImage(
  imageSource: HTMLImageElement | File,
  rawOptions: Partial<ResizeOptions> & { targetWidth: number; targetHeight: number },
  originalSizeBytesInput?: number
): Promise<ProcessResult> {
  const imageElement = await loadImageElement(imageSource);
  const originalSizeBytes =
    originalSizeBytesInput ??
    (imageSource instanceof File ? imageSource.size : 0);

  // Normalize options with intelligent defaults
  const options: ResizeOptions = {
    targetWidth: rawOptions.targetWidth,
    targetHeight: rawOptions.targetHeight,
    maintainAspectRatio: rawOptions.maintainAspectRatio ?? true,
    fitMode: rawOptions.fitMode ?? 'contain',
    backgroundColor: rawOptions.backgroundColor ?? (rawOptions.outputFormat === 'image/jpeg' ? '#FFFFFF' : 'transparent'),
    targetKb: rawOptions.targetKb ?? null,
    maxKbLimit: rawOptions.maxKbLimit ?? false,
    outputFormat: rawOptions.outputFormat ?? 'image/jpeg',
    quality: rawOptions.quality ?? 0.85,
    rotation: rawOptions.rotation ?? 0,
    trimSignatureBorders: rawOptions.trimSignatureBorders ?? false,
    enhanceSignatureContrast: rawOptions.enhanceSignatureContrast ?? rawOptions.enhanceContrast ?? false,
    autoScaleIfOverTargetKb: rawOptions.autoScaleIfOverTargetKb ?? true,
  };

  let initialSource: HTMLImageElement | HTMLCanvasElement = imageElement;

  // 1. Apply rotation first if specified
  if (options.rotation !== 0) {
    initialSource = createTransformedCanvas(initialSource, options.rotation);
  }

  // 2. If signature trim requested, trim blank margins
  if (options.trimSignatureBorders) {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = initialSource.width;
    tempCanvas.height = initialSource.height;
    const tempCtx = tempCanvas.getContext('2d');
    if (tempCtx) {
      tempCtx.drawImage(initialSource, 0, 0);
      initialSource = autoTrimCanvas(tempCanvas);
    }
  }

  let finalTargetWidth = Math.max(10, Math.round(options.targetWidth));
  let finalTargetHeight = Math.max(10, Math.round(options.targetHeight));
  let dimensionsScaled = false;

  const targetBytes = options.targetKb ? options.targetKb * 1024 : null;

  // Helper to draw onto an output canvas of specified size
  const renderToCanvas = (
    w: number,
    h: number
  ): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // Fill background color
    if (options.backgroundColor !== 'transparent' && options.backgroundColor) {
      ctx.fillStyle = options.backgroundColor;
      ctx.fillRect(0, 0, w, h);
    } else if (options.outputFormat === 'image/jpeg') {
      // JPEG doesn't support transparency, default to white
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const srcW = initialSource.width;
    const srcH = initialSource.height;

    if (options.fitMode === 'fill' || !options.maintainAspectRatio) {
      // Stretch directly
      ctx.drawImage(initialSource, 0, 0, w, h);
    } else if (options.fitMode === 'cover') {
      // Crop center to fill
      const scale = Math.max(w / srcW, h / srcH);
      const scaledW = srcW * scale;
      const scaledH = srcH * scale;
      const offsetX = (w - scaledW) / 2;
      const offsetY = (h - scaledH) / 2;
      ctx.drawImage(initialSource, offsetX, offsetY, scaledW, scaledH);
    } else {
      // 'fit' or 'contain': Keep aspect ratio and center on canvas
      const scale = Math.min(w / srcW, h / srcH);
      const scaledW = srcW * scale;
      const scaledH = srcH * scale;
      const offsetX = (w - scaledW) / 2;
      const offsetY = (h - scaledH) / 2;
      ctx.drawImage(initialSource, offsetX, offsetY, scaledW, scaledH);
    }

    // Apply signature contrast enhancement if requested
    if (options.enhanceSignatureContrast) {
      enhanceSignatureCanvas(canvas);
    }

    return canvas;
  };

  let renderCanvas = renderToCanvas(finalTargetWidth, finalTargetHeight);

  // Helper to export canvas to Blob
  const getBlob = (
    c: HTMLCanvasElement,
    format: string,
    q?: number
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      c.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob conversion failed.'));
        },
        format,
        q
      );
    });
  };

  let finalBlob: Blob;
  let finalQuality = options.quality;

  // 3. Iterative Compression for Target KB
  if (!targetBytes || options.outputFormat === 'image/png') {
    // PNG is lossless; or no target KB requested
    finalBlob = await getBlob(
      renderCanvas,
      options.outputFormat,
      options.outputFormat === 'image/png' ? undefined : options.quality
    );
  } else {
    // JPEG/WebP target KB binary search
    let lowQ = 0.08;
    let highQ = 1.0;
    let bestBlob: Blob | null = null;
    let bestQ = options.quality;

    // Run up to 8 binary search steps
    for (let step = 0; step < 8; step++) {
      const midQ = (lowQ + highQ) / 2;
      const testBlob = await getBlob(renderCanvas, options.outputFormat, midQ);

      if (testBlob.size <= targetBytes) {
        // Fits under target! Try to get higher quality if possible
        bestBlob = testBlob;
        bestQ = midQ;
        lowQ = midQ;
      } else {
        // Exceeds target, need lower quality
        highQ = midQ;
        if (!bestBlob) {
          bestBlob = testBlob;
          bestQ = midQ;
        }
      }
    }

    // Check if even at lowest quality (0.08) it's still exceeding target KB
    if (bestBlob && bestBlob.size > targetBytes && options.autoScaleIfOverTargetKb) {
      // Auto-scale dimensions down iteratively (up to 4 downscale passes)
      let currentW = finalTargetWidth;
      let currentH = finalTargetHeight;

      for (let scalePass = 0; scalePass < 4; scalePass++) {
        const ratio = Math.sqrt(targetBytes / bestBlob.size) * 0.95;
        currentW = Math.max(30, Math.round(currentW * ratio));
        currentH = Math.max(30, Math.round(currentH * ratio));
        dimensionsScaled = true;

        renderCanvas = renderToCanvas(currentW, currentH);
        const testBlob = await getBlob(renderCanvas, options.outputFormat, 0.75);

        if (testBlob.size <= targetBytes) {
          bestBlob = testBlob;
          bestQ = 0.75;
          finalTargetWidth = currentW;
          finalTargetHeight = currentH;
          break;
        } else {
          // Re-try compression on downscaled canvas
          const lowestBlob = await getBlob(renderCanvas, options.outputFormat, 0.2);
          if (lowestBlob.size <= targetBytes) {
            bestBlob = lowestBlob;
            bestQ = 0.2;
            finalTargetWidth = currentW;
            finalTargetHeight = currentH;
            break;
          }
          bestBlob = lowestBlob;
          finalTargetWidth = currentW;
          finalTargetHeight = currentH;
        }
      }
    }

    finalBlob = bestBlob || (await getBlob(renderCanvas, options.outputFormat, options.quality));
    finalQuality = bestQ;
  }

  const outputSizeBytes = finalBlob.size;
  const achievedTarget = !targetBytes || outputSizeBytes <= targetBytes;
  const compressionRatio =
    originalSizeBytes > 0
      ? Math.round(((originalSizeBytes - outputSizeBytes) / originalSizeBytes) * 100)
      : 0;

  const dataUrl = URL.createObjectURL(finalBlob);

  return {
    blob: finalBlob,
    dataUrl,
    blobUrl: dataUrl,
    width: renderCanvas.width,
    height: renderCanvas.height,
    sizeBytes: outputSizeBytes,
    format: options.outputFormat,
    outputWidth: renderCanvas.width,
    outputHeight: renderCanvas.height,
    outputSizeBytes,
    outputFormat: options.outputFormat,
    compressionRatio,
    achievedTargetKb: achievedTarget,
    actualQualityUsed: Number(finalQuality.toFixed(2)),
    dimensionsScaled,
  };
}

/**
 * Format bytes nicely into KB or MB string
 */
export function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

export const formatBytes = formatFileSize;
