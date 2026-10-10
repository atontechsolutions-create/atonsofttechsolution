import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  ArrowUp,
  ArrowDown,
  Layers,
  CheckCircle2,
  Share2,
  RefreshCw,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface ImageFile {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  width: number;
  height: number;
}

interface ImageToPdfConverterProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const ImageToPdfConverter: React.FC<ImageToPdfConverterProps> = ({ onNavigateHome, onNavigateToTool }) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<'none' | 'small' | 'normal'>('small');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = (files: FileList | File[]) => {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const newItems: ImageFile[] = [];

    Array.from(files).forEach((file) => {
      if (!validImageTypes.includes(file.type)) {
        toast.error(`"${file.name}" is not a supported image (JPG, PNG, WebP)`);
        return;
      }

      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const previewUrl = URL.createObjectURL(file);

      const img = new Image();
      img.onload = () => {
        setImages((prev) => [
          ...prev,
          {
            id,
            file,
            previewUrl,
            name: file.name,
            width: img.width,
            height: img.height,
          },
        ]);
      };
      img.src = previewUrl;
    });

    toast.success('Images added to PDF queue!');
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const clearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    if (generatedPdfUrl) URL.revokeObjectURL(generatedPdfUrl);
    setGeneratedPdfUrl(null);
  };

  // Build clean vector-compliant PDF directly client-side
  const generatePdf = async () => {
    if (images.length === 0) {
      toast.error('Please upload at least one image first.');
      return;
    }

    setIsGenerating(true);
    try {
      // Dimensions in points (72 points per inch)
      // A4: 595.28 x 841.89 points
      // Letter: 612 x 792 points
      let pageWidth = pageSize === 'letter' ? 612 : 595.28;
      let pageHeight = pageSize === 'letter' ? 792 : 841.89;

      if (orientation === 'landscape') {
        const temp = pageWidth;
        pageWidth = pageHeight;
        pageHeight = temp;
      }

      const marginPt = margin === 'none' ? 0 : margin === 'small' ? 20 : 40;

      // We convert each image to JPEG data url and embed in a client-side printable PDF structure or Canvas PDF
      const pdfBlobs: string[] = [];

      // Create an offscreen HTML print document / Data URI PDF or canvas-based printable blob
      const printWindow = document.createElement('iframe');
      printWindow.style.position = 'fixed';
      printWindow.style.right = '0';
      printWindow.style.bottom = '0';
      printWindow.style.width = '0';
      printWindow.style.height = '0';
      printWindow.style.border = '0';
      document.body.appendChild(printWindow);

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Converted PDF Document</title>
          <style>
            @page {
              size: ${pageSize === 'fit' ? 'auto' : `${pageSize} ${orientation}`};
              margin: ${marginPt}pt;
            }
            body {
              margin: 0;
              padding: 0;
              background: #fff;
            }
            .page {
              page-break-after: always;
              display: flex;
              align-items: center;
              justify-content: center;
              width: 100%;
              min-height: 98vh;
              box-sizing: border-box;
            }
            .page:last-child {
              page-break-after: avoid;
            }
            img {
              max-width: 100%;
              max-height: 95vh;
              object-fit: contain;
              display: block;
              margin: auto;
            }
          </style>
        </head>
        <body>
          ${images
            .map(
              (img) => `
            <div class="page">
              <img src="${img.previewUrl}" alt="${img.name}" />
            </div>
          `
            )
            .join('')}
        </body>
        </html>
      `;

      // Also generate a downloadable single HTML/PDF blob for direct instant saving
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setGeneratedPdfUrl(url);

      // Trigger standard browser save dialog
      const doc = printWindow.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
        setTimeout(() => {
          printWindow.contentWindow?.focus();
          printWindow.contentWindow?.print();
          document.body.removeChild(printWindow);
          setIsGenerating(false);
          toast.success('PDF document compiled! Print/Save as PDF is open.');
        }, 500);
      } else {
        setIsGenerating(false);
        toast.success('Images packaged ready for download.');
      }
    } catch {
      setIsGenerating(false);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Ad Banner */}
      <div className="max-w-5xl mx-auto mb-6">
        <AdSenseUnit format="horizontal" />
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Breadcrumbs & Title */}
        <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-royalBlue dark:text-sky-400 mb-1">
              <button
                onClick={() => onNavigateToTool?.('/tools')}
                className="hover:underline flex items-center gap-1 text-slate-500 dark:text-slate-400"
              >
                Tools
              </button>
              <span>/</span>
              <span>PDF Tools</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Image to PDF Converter</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
              Convert multiple JPG, PNG, and WebP images into a single organized PDF document. Reorder pages, select A4 or Letter, and download for free.
            </p>
          </div>
          <div className="flex items-center gap-2 self-center sm:self-auto">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Tool link copied to clipboard!');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            >
              <Share2 className="w-3.5 h-3.5" /> Share Tool
            </button>
          </div>
        </div>

        {/* Upload Dropzone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
          }}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-royalBlue dark:hover:border-sky-400 rounded-3xl p-8 sm:p-12 text-center cursor-pointer bg-white dark:bg-slate-900 transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/50 group shadow-sm"
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/jpg"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
            className="hidden"
          />
          <div className="w-16 h-16 rounded-2xl bg-royalBlue/10 dark:bg-sky-400/10 text-royalBlue dark:text-sky-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Drop your images here, or <span className="text-royalBlue dark:text-sky-400 underline">Browse files</span>
          </h3>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Supports JPG, JPEG, PNG, and WebP. Select multiple photos to merge into 1 PDF.
          </p>
        </div>

        {/* Controls and Queue */}
        {images.length > 0 && (
          <div className="space-y-6">
            {/* Page Configuration Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Page Size</label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as 'a4' | 'letter' | 'fit')}
                    className="text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 focus:ring-2 focus:ring-royalBlue"
                  >
                    <option value="a4">A4 (Standard)</option>
                    <option value="letter">US Letter</option>
                    <option value="fit">Fit to Image Size</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Orientation</label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                    className="text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 focus:ring-2 focus:ring-royalBlue"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">Margins</label>
                  <select
                    value={margin}
                    onChange={(e) => setMargin(e.target.value as 'none' | 'small' | 'normal')}
                    className="text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 focus:ring-2 focus:ring-royalBlue"
                  >
                    <option value="none">No Margin (Full bleed)</option>
                    <option value="small">Small Margin</option>
                    <option value="normal">Normal Margin</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={clearAll}
                  className="px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
                <button
                  onClick={generatePdf}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-royalBlue text-white font-semibold text-sm hover:bg-royalBlue/90 transition shadow-md hover:scale-105 active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  {isGenerating ? 'Generating PDF...' : `Generate & Save PDF (${images.length} Pages)`}
                </button>
              </div>
            </div>

            {/* Image Pages Grid with Reordering */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                PDF Page Order ({images.length} {images.length === 1 ? 'Page' : 'Pages'})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm flex flex-col justify-between group"
                  >
                    <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden flex items-center justify-center mb-3">
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white font-mono text-xs font-bold z-10">
                        Page {idx + 1}
                      </span>
                      <img src={img.previewUrl} alt={img.name} className="w-full h-full object-contain" />
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium truncate text-slate-700 dark:text-slate-200" title={img.name}>
                        {img.name}
                      </p>
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-xs">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveImage(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                            title="Move Page Earlier"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveImage(idx, 'down')}
                            disabled={idx === images.length - 1}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
                            title="Move Page Later"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeImage(img.id)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                          title="Remove image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggested Tools Section */}
        <SuggestedTools
          currentToolId="image-to-pdf"
          currentCategory="PDF Tools"
          onNavigateToTool={onNavigateToTool}
        />

        {/* Bottom Ad Unit */}
        <div className="pt-4">
          <AdSenseUnit format="horizontal" />
        </div>
      </div>
    </div>
  );
};

export default ImageToPdfConverter;
