import * as pdfjsLib from 'pdfjs-dist';

// Initialize PDF.js worker
let isInitialized = false;

export function initPdfWorker() {
  if (isInitialized) return;
  try {
    if (typeof window !== 'undefined') {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      isInitialized = true;
    }
  } catch (err) {
    console.warn('Could not set pdf.js workerSrc, rendering will use main thread fallback:', err);
  }
}

/**
 * Creates an attractive SVG placeholder for a page if rendering fails or while loading
 */
export function createPagePlaceholderSvg(pageNumber: number, label?: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="420" viewBox="0 0 300 420" fill="none">
    <rect width="300" height="420" rx="12" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
    <rect x="24" y="24" width="70" height="14" rx="4" fill="#E2E8F0"/>
    <rect x="24" y="52" width="252" height="10" rx="3" fill="#CBD5E1"/>
    <rect x="24" y="70" width="230" height="8" rx="2" fill="#E2E8F0"/>
    <rect x="24" y="86" width="240" height="8" rx="2" fill="#E2E8F0"/>
    <rect x="24" y="102" width="180" height="8" rx="2" fill="#E2E8F0"/>
    <rect x="24" y="130" width="252" height="120" rx="8" fill="#F1F5F9" stroke="#E2E8F0"/>
    <circle cx="150" cy="180" r="24" fill="#E2E8F0"/>
    <path d="M140 180L148 188L162 172" stroke="#94A3B8" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="24" y="270" width="252" height="8" rx="2" fill="#E2E8F0"/>
    <rect x="24" y="286" width="210" height="8" rx="2" fill="#E2E8F0"/>
    <rect x="24" y="302" width="230" height="8" rx="2" fill="#E2E8F0"/>
    <rect x="24" y="318" width="160" height="8" rx="2" fill="#E2E8F0"/>
    <circle cx="150" cy="370" r="20" fill="#E11D48"/>
    <text x="150" y="376" font-family="system-ui, sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">${pageNumber}</text>
    ${label ? `<text x="150" y="405" font-family="system-ui, sans-serif" font-size="11" fill="#64748B" text-anchor="middle">${label}</text>` : ''}
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Render all pages of a PDF to thumbnail images.
 * Calls onPageRendered callback as each page finishes rendering so the UI updates progressively.
 */
export async function renderPdfThumbnails(
  arrayBuffer: ArrayBuffer,
  onPageRendered?: (pageIndex: number, dataUrl: string) => void,
  scale: number = 0.45
): Promise<string[]> {
  initPdfWorker();
  const thumbnails: string[] = [];

  try {
    // Clone buffer because PDF.js may detach it in web workers
    const bufferCopy = arrayBuffer.slice(0);
    const loadingTask = pdfjsLib.getDocument({
      data: bufferCopy,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true,
    });

    const pdf = await loadingTask.promise;
    const numPages = pdf.numPages;

    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          throw new Error('Canvas context not available');
        }

        canvas.width = Math.max(1, Math.floor(viewport.width));
        canvas.height = Math.max(1, Math.floor(viewport.height));

        // Fill white background before rendering
        context.fillStyle = '#FFFFFF';
        context.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        thumbnails.push(dataUrl);

        if (onPageRendered) {
          onPageRendered(i - 1, dataUrl);
        }
      } catch (pageErr) {
        console.warn(`Error rendering page ${i}:`, pageErr);
        const fallback = createPagePlaceholderSvg(i, `Page ${i}`);
        thumbnails.push(fallback);
        if (onPageRendered) {
          onPageRendered(i - 1, fallback);
        }
      }
    }

    return thumbnails;
  } catch (docErr) {
    console.error('Failed to load PDF with pdf.js:', docErr);
    return thumbnails;
  }
}

/**
 * Render a single page in high resolution (for full-screen preview or PDF-to-Image download)
 */
export async function renderPdfPageToImage(
  arrayBuffer: ArrayBuffer,
  pageIndex: number, // 0-based
  scale: number = 2.0,
  format: 'image/jpeg' | 'image/png' | 'image/webp' = 'image/jpeg',
  quality: number = 0.95
): Promise<{ dataUrl: string; width: number; height: number }> {
  initPdfWorker();

  try {
    const bufferCopy = arrayBuffer.slice(0);
    const loadingTask = pdfjsLib.getDocument({
      data: bufferCopy,
      cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
      cMapPacked: true,
    });

    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageIndex + 1);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas 2D context unavailable');

    canvas.width = Math.max(1, Math.floor(viewport.width));
    canvas.height = Math.max(1, Math.floor(viewport.height));

    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, canvas.width, canvas.height);

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    const dataUrl = canvas.toDataURL(format, quality);
    return {
      dataUrl,
      width: canvas.width,
      height: canvas.height,
    };
  } catch (err) {
    console.error(`Failed to render high-res page ${pageIndex + 1}:`, err);
    return {
      dataUrl: createPagePlaceholderSvg(pageIndex + 1, `Page ${pageIndex + 1}`),
      width: 600,
      height: 840,
    };
  }
}
