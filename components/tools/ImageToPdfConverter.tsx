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
  RotateCw,
  MoveLeft,
  MoveRight,
  Maximize2,
  X,
  Sparkles,
  FileCheck,
  ExternalLink,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
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
  rotation: number; // 0, 90, 180, 270
}

interface ImageToPdfConverterProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const ImageToPdfConverter: React.FC<ImageToPdfConverterProps> = ({
  onNavigateToTool,
}) => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [pageSize, setPageSize] = useState<'a4' | 'letter' | 'fit'>('a4');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [margin, setMargin] = useState<'none' | 'small' | 'normal'>('small');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null);
  const [generatedFileName, setGeneratedFileName] = useState<string>('converted-document.pdf');
  const [previewModalImg, setPreviewModalImg] = useState<ImageFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList | File[]) => {
    const list = Array.from(files);
    if (list.length === 0) return;

    let addedCount = 0;
    list.forEach((file) => {
      // Accept all common image types
      if (!file.type.startsWith('image/') && !/\.(jpe?g|png|webp|gif|bmp|tiff?|ico|avif)$/i.test(file.name)) {
        toast.error(`"${file.name}" is not a supported image file.`);
        return;
      }

      addedCount++;
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
            width: img.width || 800,
            height: img.height || 600,
            rotation: 0,
          },
        ]);
      };
      img.onerror = () => {
        // Fallback dimensions if format preview isn't immediately renderable
        setImages((prev) => [
          ...prev,
          {
            id,
            file,
            previewUrl,
            name: file.name,
            width: 800,
            height: 600,
            rotation: 0,
          },
        ]);
      };
      img.src = previewUrl;
    });

    if (addedCount > 0) {
      // Invalidate old generated PDF when new images are added
      if (generatedPdfUrl) {
        URL.revokeObjectURL(generatedPdfUrl);
        setGeneratedPdfUrl(null);
      }
      toast.success(`Added ${addedCount} image(s) to PDF workspace!`);
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((img) => img.id !== id);
    });
    if (generatedPdfUrl) {
      URL.revokeObjectURL(generatedPdfUrl);
      setGeneratedPdfUrl(null);
    }
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  const rotateImage = (id: string, degreesVal = 90) => {
    setImages((prev) =>
      prev.map((img) =>
        img.id === id
          ? { ...img, rotation: (img.rotation + degreesVal + 360) % 360 }
          : img
      )
    );
  };

  const clearAll = () => {
    images.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    setImages([]);
    if (generatedPdfUrl) URL.revokeObjectURL(generatedPdfUrl);
    setGeneratedPdfUrl(null);
    toast('Image workspace cleared', { icon: '🧹' });
  };

  // Convert an HTML Image to a clean PNG/JPEG ArrayBuffer accounting for canvas rotation
  const processImageToBytes = async (imgFile: ImageFile): Promise<{ bytes: Uint8Array; format: 'png' | 'jpg' }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const rot = imgFile.rotation % 360;
          const isSideways = rot === 90 || rot === 270;

          const width = isSideways ? img.naturalHeight || img.height : img.naturalWidth || img.width;
          const height = isSideways ? img.naturalWidth || img.width : img.naturalHeight || img.height;

          canvas.width = Math.max(1, width);
          canvas.height = Math.max(1, height);
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas 2D context unavailable'));
            return;
          }

          // Fill white background (no black borders on transparent images)
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Apply rotation transform
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rot * Math.PI) / 180);
          ctx.drawImage(
            img,
            - (img.naturalWidth || img.width) / 2,
            - (img.naturalHeight || img.height) / 2
          );
          ctx.restore();

          // Export as JPEG for high fidelity and compact size
          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                reject(new Error('Blob creation failed'));
                return;
              }
              const buffer = await blob.arrayBuffer();
              resolve({ bytes: new Uint8Array(buffer), format: 'jpg' });
            },
            'image/jpeg',
            0.92
          );
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image for processing'));
      img.src = imgFile.previewUrl;
    });
  };

  // Build real, 100% vector-compliant PDF directly via pdf-lib and auto-download
  const generatePdf = async () => {
    if (images.length === 0) {
      toast.error('Please upload at least one image first.');
      return;
    }

    setIsGenerating(true);
    try {
      const pdfDoc = await PDFDocument.create();

      // Page dimensions in PDF points (72 pt per inch)
      // A4 = 595.28 x 841.89 pt
      // US Letter = 612 x 792 pt
      const standardWidth = pageSize === 'letter' ? 612 : 595.28;
      const standardHeight = pageSize === 'letter' ? 792 : 841.89;

      const marginPt = margin === 'none' ? 0 : margin === 'small' ? 24 : 48;

      for (let i = 0; i < images.length; i++) {
        const item = images[i];
        const { bytes } = await processImageToBytes(item);
        const embeddedImg = await pdfDoc.embedJpg(bytes);

        const imgWidth = embeddedImg.width;
        const imgHeight = embeddedImg.height;

        let pageWidth: number;
        let pageHeight: number;

        if (pageSize === 'fit') {
          // Fit page exactly to image with optional margins
          pageWidth = imgWidth + marginPt * 2;
          pageHeight = imgHeight + marginPt * 2;
        } else {
          // Standard A4 or Letter
          if (orientation === 'landscape') {
            pageWidth = Math.max(standardWidth, standardHeight);
            pageHeight = Math.min(standardWidth, standardHeight);
          } else {
            pageWidth = Math.min(standardWidth, standardHeight);
            pageHeight = Math.max(standardWidth, standardHeight);
          }
        }

        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Compute aspect-ratio fitted image coordinates inside page printable area
        const printableWidth = Math.max(10, pageWidth - marginPt * 2);
        const printableHeight = Math.max(10, pageHeight - marginPt * 2);

        const scale = Math.min(
          printableWidth / imgWidth,
          printableHeight / imgHeight
        );

        const renderWidth = imgWidth * scale;
        const renderHeight = imgHeight * scale;

        // Centered inside printable area
        const drawX = marginPt + (printableWidth - renderWidth) / 2;
        const drawY = marginPt + (printableHeight - renderHeight) / 2;

        page.drawImage(embeddedImg, {
          x: drawX,
          y: drawY,
          width: renderWidth,
          height: renderHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      const baseName = images[0]?.name.replace(/\.[^.]+$/, '') || 'images';
      const outName = `${baseName}-converted-${images.length}pages.pdf`;

      setGeneratedPdfUrl(url);
      setGeneratedFileName(outName);

      // Auto trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = outName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`PDF created and downloaded (${images.length} pages)!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8 pb-32">
      {/* Top Ad Banner */}
      <div className="max-w-6xl mx-auto mb-6">
        <AdSenseUnit format="horizontal" />
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Breadcrumbs & Title */}
        <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-1">
              <button
                onClick={() => onNavigateToTool?.('/tools')}
                className="hover:underline flex items-center gap-1 cursor-pointer"
              >
                Tools
              </button>
              <ChevronRight size={12} />
              <button
                onClick={() => onNavigateToTool?.('/tools/merge-pdf')}
                className="hover:underline cursor-pointer"
              >
                PDF Suite
              </button>
              <ChevronRight size={12} />
              <span className="text-slate-500">Image to PDF</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              Image to PDF Converter
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Convert JPG, PNG, and WebP images into a single professional PDF document. Reorder pages, rotate images, choose margins, and download directly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
              <CheckCircle2 size={13} /> 100% Client-Side
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
              PDF-Lib Vector Engine
            </span>
          </div>
        </div>

        {/* Upload Box */}
        {images.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-10 sm:p-16 text-center cursor-pointer transition-all group shadow-sm ${
              isDragging
                ? 'border-rose-600 bg-rose-50/80 dark:bg-rose-950/40 ring-4 ring-rose-500/20 scale-[0.99]'
                : 'border-rose-300 dark:border-rose-900/60 hover:border-rose-500 dark:hover:border-rose-400 bg-white dark:bg-slate-900/60 hover:bg-rose-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => {
                if (e.target.files) handleFiles(e.target.files);
              }}
              className="hidden"
            />
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-rose-50 dark:bg-rose-950/70 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform shadow-inner">
              <Upload size={38} />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              Select or Drop Images to Convert to PDF
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Supports JPG, JPEG, PNG, WebP, GIF, and BMP. You can arrange page sequence, rotate pages, and pick A4/Letter sizing.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-7 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/25 transition">
              <Upload size={16} /> Choose Images from Device
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Conversion Settings Toolbar */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-5">
              <div className="flex flex-wrap items-center gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Page Size
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(e.target.value as 'a4' | 'letter' | 'fit')}
                    className="text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="a4">A4 (Standard 210×297mm)</option>
                    <option value="letter">US Letter (8.5×11 in)</option>
                    <option value="fit">Fit to Image Size</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Orientation
                  </label>
                  <select
                    value={orientation}
                    onChange={(e) => setOrientation(e.target.value as 'portrait' | 'landscape')}
                    className="text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Margins
                  </label>
                  <select
                    value={margin}
                    onChange={(e) => setMargin(e.target.value as 'none' | 'small' | 'normal')}
                    className="text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 focus:ring-2 focus:ring-rose-500"
                  >
                    <option value="none">No Margin (Full bleed)</option>
                    <option value="small">Small Margin (24 pt)</option>
                    <option value="normal">Normal Margin (48 pt)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 ml-auto">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) handleFiles(e.target.files);
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-2 text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" /> Add More Images
                </button>
                <button
                  onClick={clearAll}
                  className="px-3.5 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear All
                </button>
                <button
                  onClick={generatePdf}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-rose-600 text-white font-extrabold text-sm hover:bg-rose-700 transition shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Compiling PDF...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" /> Convert to PDF & Download ({images.length} {images.length === 1 ? 'Page' : 'Pages'})
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Success Download Banner */}
            {generatedPdfUrl && (
              <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-5 animate-scale-up">
                <div className="flex items-center gap-4 text-center md:text-left">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 size={32} className="text-white" />
                  </div>
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
                      Compiled • Ready
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold mt-1">
                      Your PDF Document is Ready!
                    </h3>
                    <p className="text-xs sm:text-sm text-emerald-100 mt-0.5">
                      File: {generatedFileName} ({images.length} pages)
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={generatedPdfUrl}
                    download={generatedFileName}
                    className="px-7 py-3 rounded-2xl font-black text-emerald-950 bg-white hover:bg-emerald-50 transition-all shadow-lg hover:scale-105 flex items-center gap-2 text-sm sm:text-base cursor-pointer"
                  >
                    <Download size={18} /> Download PDF Now
                  </a>
                  <a
                    href={generatedPdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-2xl bg-white/20 hover:bg-white/30 text-white transition flex items-center"
                    title="Open PDF in new tab"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            )}

            {/* Image Pages Grid with Reordering & Rotating */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Layers size={16} className="text-rose-500" />
                  PDF Page Sequence ({images.length} {images.length === 1 ? 'Page' : 'Pages'})
                </h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Use arrows to change page order • Rotate 90°
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm flex flex-col justify-between group hover:border-rose-400 dark:hover:border-rose-500 transition-all"
                  >
                    {/* Header badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[11px]">
                        Page {idx + 1}
                      </span>
                      <button
                        onClick={() => rotateImage(img.id, 90)}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        title="Rotate 90° Clockwise"
                      >
                        <RotateCw size={13} />
                      </button>
                    </div>

                    {/* Preview box */}
                    <div
                      onClick={() => setPreviewModalImg(img)}
                      className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-800/60 rounded-xl overflow-hidden flex items-center justify-center mb-2.5 cursor-pointer select-none"
                    >
                      <img
                        src={img.previewUrl}
                        alt={img.name}
                        className="w-full h-full object-contain transition-transform duration-200"
                        style={{
                          transform: `rotate(${img.rotation}deg)`,
                        }}
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="p-2 rounded-xl bg-white/90 text-slate-900 shadow">
                          <Maximize2 size={14} />
                        </span>
                      </div>
                    </div>

                    {/* Card Footer Controls */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-semibold truncate text-slate-700 dark:text-slate-300" title={img.name}>
                        {img.name}
                      </p>
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-xs">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveImage(idx, 'left')}
                            disabled={idx === 0}
                            className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                            title="Move Earlier in PDF"
                          >
                            <MoveLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => moveImage(idx, 'right')}
                            disabled={idx === images.length - 1}
                            className="p-1 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer"
                            title="Move Later in PDF"
                          >
                            <MoveRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeImage(img.id)}
                          className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-md cursor-pointer"
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

        {/* Modal Full Zoom Preview */}
        {previewModalImg && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="relative bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {previewModalImg.name}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {previewModalImg.width} × {previewModalImg.height} px • Rotation: {previewModalImg.rotation}°
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => rotateImage(previewModalImg.id, 90)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                    title="Rotate 90°"
                  >
                    <RotateCw size={15} />
                  </button>
                  <button
                    onClick={() => setPreviewModalImg(null)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="p-4 flex-1 flex items-center justify-center bg-slate-100 dark:bg-black/40 overflow-hidden">
                <img
                  src={previewModalImg.previewUrl}
                  alt={previewModalImg.name}
                  className="max-h-[60vh] max-w-full object-contain rounded-xl shadow transition-transform"
                  style={{
                    transform: `rotate(${previewModalImg.rotation}deg)`,
                  }}
                />
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

      {/* Sticky Bottom Bar for Image to PDF */}
      {images.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 shadow-2xl py-3 px-4 sm:px-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                <FileText size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {images.length} Image{images.length === 1 ? '' : 's'} Selected
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Size: {pageSize.toUpperCase()} • Margins: {margin}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {generatedPdfUrl && (
                <a
                  href={generatedPdfUrl}
                  download={generatedFileName}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow"
                >
                  <Download size={14} /> Download PDF
                </a>
              )}
              <button
                onClick={generatePdf}
                disabled={isGenerating}
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-lg shadow-rose-600/30 flex items-center gap-2 text-xs sm:text-sm cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" /> Compiling...
                  </>
                ) : (
                  <>
                    <Download size={15} /> Convert to PDF Now ➔
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageToPdfConverter;
