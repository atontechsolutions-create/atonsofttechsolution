import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Share2,
  CheckCircle2,
  Info,
  Sliders,
  Sparkles,
  Maximize2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface ImageDetails {
  name: string;
  fileSizeKb: number;
  fileSizeBytes: number;
  mimeType: string;
  width: number;
  height: number;
  aspectRatio: string;
  aspectRatioDecimal: number;
  megapixels: number;
  // Estimated print dimensions at 300 DPI, 150 DPI, 72 DPI
  printSizes: {
    dpi300: { cmW: number; cmH: number; inW: number; inH: number };
    dpi150: { cmW: number; cmH: number; inW: number; inH: number };
    dpi72: { cmW: number; cmH: number; inW: number; inH: number };
  };
}

const ImageDpiDimensionsChecker: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [details, setDetails] = useState<ImageDetails | null>(null);
  const [targetDpi, setTargetDpi] = useState<number>(300);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, WebP, GIF)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImagePreview(src);
      setSelectedFile(file);

      const img = new Image();
      img.src = src;
      img.onload = () => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;

        const divisor = gcd(w, h);
        const aspectRatio = `${w / divisor}:${h / divisor}`;
        const aspectRatioDecimal = Number((w / h).toFixed(2));
        const megapixels = Number(((w * h) / 1000000).toFixed(2));

        const calcPrint = (dpi: number) => {
          const inW = Number((w / dpi).toFixed(2));
          const inH = Number((h / dpi).toFixed(2));
          const cmW = Number((inW * 2.54).toFixed(2));
          const cmH = Number((inH * 2.54).toFixed(2));
          return { inW, inH, cmW, cmH };
        };

        setDetails({
          name: file.name,
          fileSizeKb: Math.round(file.size / 1024),
          fileSizeBytes: file.size,
          mimeType: file.type,
          width: w,
          height: h,
          aspectRatio,
          aspectRatioDecimal,
          megapixels,
          printSizes: {
            dpi300: calcPrint(300),
            dpi150: calcPrint(150),
            dpi72: calcPrint(72),
          },
        });

        toast.success(`Dimensions inspected: ${w} × ${h} px`);
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Sliders className="w-4 h-4" />
            Instant EXIF & Resolution Inspector
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            Image DPI & Dimensions Checker
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Check the exact pixel width, pixel height, file size in KB/MB, aspect ratio, and estimated print dimensions at 300 DPI, 150 DPI, and 72 DPI. 100% client-side privacy.
          </p>
        </div>

        <AdSenseUnit className="max-w-4xl mx-auto mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Upload & Image Box */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" /> Select Image to Inspect
              </h2>

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                }}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-gray-850/50"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                <Maximize2 className="w-10 h-10 mx-auto text-indigo-500 mb-2 opacity-80" />
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {selectedFile ? selectedFile.name : 'Upload image to view exact specs'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  JPG, PNG, WebP, GIF, or SVG
                </p>
              </div>

              {/* Preview image */}
              {imagePreview && (
                <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-850 rounded-xl flex items-center justify-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-56 object-contain rounded border border-gray-300 dark:border-gray-700"
                  />
                </div>
              )}
            </div>

            {/* DPI Calculator helper */}
            <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-3">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-600" /> Print DPI Guide (Dots Per Inch)
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                <strong>300 DPI:</strong> Standard for photo prints, passports, magazines, and official documents.
                <br />
                <strong>150 DPI:</strong> Suitable for flyers, newspapers, and desktop monitors.
                <br />
                <strong>72 DPI:</strong> Standard for web images, social media, and email attachments.
              </p>
            </div>
          </div>

          {/* Details & Specs Card */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Image Dimensions & Technical Specs
              </h2>

              {details ? (
                <div className="space-y-6">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Width</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                        {details.width} px
                      </div>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Height</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                        {details.height} px
                      </div>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">File Size</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                        {details.fileSizeKb} KB
                      </div>
                    </div>
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Resolution</div>
                      <div className="text-lg font-bold text-gray-900 dark:text-white font-mono mt-0.5">
                        {details.megapixels} MP
                      </div>
                    </div>
                  </div>

                  {/* Detailed Spec Table */}
                  <div className="border border-gray-200 dark:border-gray-750 rounded-xl overflow-hidden divide-y divide-gray-200 dark:divide-gray-750 text-sm">
                    <div className="flex justify-between p-3 bg-gray-50/50 dark:bg-gray-850/50">
                      <span className="text-gray-500">File Name</span>
                      <span className="font-medium text-gray-900 dark:text-white truncate max-w-xs">{details.name}</span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span className="text-gray-500">Aspect Ratio</span>
                      <span className="font-semibold text-gray-900 dark:text-white font-mono">
                        {details.aspectRatio} ({details.aspectRatioDecimal}:1)
                      </span>
                    </div>
                    <div className="flex justify-between p-3 bg-gray-50/50 dark:bg-gray-850/50">
                      <span className="text-gray-500">Exact Bytes</span>
                      <span className="font-mono text-gray-900 dark:text-white">{details.fileSizeBytes.toLocaleString()} bytes</span>
                    </div>
                    <div className="flex justify-between p-3">
                      <span className="text-gray-500">MIME Type</span>
                      <span className="font-mono text-gray-900 dark:text-white">{details.mimeType}</span>
                    </div>
                  </div>

                  {/* Estimated Print Sizes */}
                  <div className="pt-2">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Print Sizes at Different DPI Resolutions:
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20">
                        <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          300 DPI (High Quality Print)
                        </div>
                        <div className="mt-2 text-sm font-bold text-gray-900 dark:text-white">
                          {details.printSizes.dpi300.cmW} × {details.printSizes.dpi300.cmH} cm
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {details.printSizes.dpi300.inW} × {details.printSizes.dpi300.inH} inches
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20">
                        <div className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                          150 DPI (Medium Quality)
                        </div>
                        <div className="mt-2 text-sm font-bold text-gray-900 dark:text-white">
                          {details.printSizes.dpi150.cmW} × {details.printSizes.dpi150.cmH} cm
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {details.printSizes.dpi150.inW} × {details.printSizes.dpi150.inH} inches
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20">
                        <div className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                          72 DPI (Standard Screen / Web)
                        </div>
                        <div className="mt-2 text-sm font-bold text-gray-900 dark:text-white">
                          {details.printSizes.dpi72.cmW} × {details.printSizes.dpi72.cmH} cm
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {details.printSizes.dpi72.inW} × {details.printSizes.dpi72.inH} inches
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="min-h-[260px] flex flex-col items-center justify-center text-center p-8 border border-dashed border-gray-300 dark:border-gray-800 rounded-xl">
                  <Maximize2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    No image uploaded yet
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Upload any photo or signature to inspect pixel dimensions and print readiness.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <SuggestedTools currentToolId="image-dimensions-checker" />
      </div>
    </div>
  );
};

export default ImageDpiDimensionsChecker;
