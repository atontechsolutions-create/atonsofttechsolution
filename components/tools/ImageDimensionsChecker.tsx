import React, { useState, useRef } from 'react';
import {
  Maximize2,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  FileCheck,
  Smartphone,
  Monitor,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface ImageDimensionsCheckerProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const ImageDimensionsChecker: React.FC<ImageDimensionsCheckerProps> = ({
  onNavigateHome,
  onNavigateToTool,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [widthPx, setWidthPx] = useState<number>(0);
  const [heightPx, setHeightPx] = useState<number>(0);
  const [fileSizeKb, setFileSizeKb] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const gcd = (a: number, b: number): number => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const getAspectRatioFraction = (w: number, h: number) => {
    if (!w || !h) return 'N/A';
    const divisor = gcd(w, h);
    return `${w / divisor} : ${h / divisor}`;
  };

  const getCommonRatioLabel = (w: number, h: number) => {
    if (!w || !h) return '';
    const ratio = w / h;
    if (Math.abs(ratio - 1) < 0.05) return '1:1 Square (Profile / Instagram Post)';
    if (Math.abs(ratio - 16 / 9) < 0.05) return '16:9 Widescreen (YouTube Thumbnail / Monitor)';
    if (Math.abs(ratio - 9 / 16) < 0.05) return '9:16 Vertical (Instagram Story / TikTok / Reel)';
    if (Math.abs(ratio - 4 / 3) < 0.05) return '4:3 Standard Photo / iPad Display';
    if (Math.abs(ratio - 3 / 4) < 0.05) return '3:4 Portrait / Passport Photo standard';
    if (Math.abs(ratio - 3 / 2) < 0.05) return '3:2 Classic 35mm DSLR Photo';
    return `${(w / h).toFixed(2)} : 1 Custom Aspect Ratio`;
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setImageSrc(src);
      setSelectedFile(file);
      setFileSizeKb(Math.round(file.size / 1024));

      const img = new Image();
      img.src = src;
      img.onload = () => {
        setWidthPx(img.width);
        setHeightPx(img.height);
        toast.success(`Dimensions inspected: ${img.width} × ${img.height} px`);
      };
    };
    reader.readAsDataURL(file);
  };

  const megapixels = ((widthPx * heightPx) / 1000000).toFixed(2);
  const orientation =
    widthPx > heightPx ? 'Landscape (Horizontal)' : widthPx < heightPx ? 'Portrait (Vertical)' : 'Square (1:1)';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-100/80 text-royalBlue dark:bg-royalBlue/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-3">
          <Maximize2 size={14} />
          <span>Standalone Dimensions & Aspect Ratio Inspector</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Image <span className="text-transparent bg-clip-text bg-gradient-to-r from-royalBlue to-blue-500">Dimensions Checker</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Instantly check image width, height, aspect ratio, megapixels, and orientation for social media platforms and official application portals.
        </p>
      </div>

      <AdSenseUnit placementLabel="Dimensions Checker Top Banner" />

      {/* Main Container */}
      <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
        {!imageSrc ? (
          <div className="p-8 sm:p-14 text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-royalBlue rounded-3xl p-10 sm:p-16 cursor-pointer transition-all bg-gray-50/60 dark:bg-slate-800/40 hover:bg-blue-50/40 group flex flex-col items-center justify-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-royalBlue dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
                <Maximize2 size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Upload image to check exact pixel dimensions
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Fast pixel readout with aspect ratio calculations and social media compatibility checks.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-royalBlue dark:bg-blue-950/60 dark:text-blue-300">
                  Exact Width × Height
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  Aspect Ratio
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  Megapixels & Weight
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
            {/* Left Controls */}
            <div className="lg:col-span-6 space-y-6">
              {/* Inspection Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-royalBlue block">Width</span>
                  <div className="text-2xl font-black font-mono text-gray-900 dark:text-white mt-1">
                    {widthPx} <span className="text-xs font-normal text-gray-500">px</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-royalBlue block">Height</span>
                  <div className="text-2xl font-black font-mono text-gray-900 dark:text-white mt-1">
                    {heightPx} <span className="text-xs font-normal text-gray-500">px</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Aspect Ratio</span>
                  <div className="text-lg font-bold font-mono text-gray-900 dark:text-white mt-1">
                    {getAspectRatioFraction(widthPx, heightPx)}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5 truncate">{getCommonRatioLabel(widthPx, heightPx)}</div>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 block">Total Megapixels</span>
                  <div className="text-lg font-bold font-mono text-gray-900 dark:text-white mt-1">
                    {megapixels} <span className="text-xs font-normal text-gray-500">MP</span>
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">File: {fileSizeKb} KB</div>
                </div>
              </div>

              {/* Orientation & Compatibility */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 space-y-2 text-xs">
                <span className="font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider text-[11px] block">
                  Orientation & Display Fit
                </span>
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-300 py-1 border-b border-gray-200 dark:border-slate-700">
                  <span>Orientation</span>
                  <strong className="text-gray-900 dark:text-white">{orientation}</strong>
                </div>
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-300 py-1 border-b border-gray-200 dark:border-slate-700">
                  <span>Decimal Ratio</span>
                  <strong className="font-mono text-gray-900 dark:text-white">{(widthPx / heightPx).toFixed(3)}</strong>
                </div>
                <div className="flex items-center justify-between text-gray-600 dark:text-gray-300 py-1">
                  <span>File Format</span>
                  <strong className="uppercase text-royalBlue">{selectedFile?.type.split('/')[1] || 'IMAGE'}</strong>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <Upload size={14} />
                  <span>Check Another Image</span>
                </button>
                <button
                  onClick={() => {
                    setImageSrc(null);
                    setSelectedFile(null);
                  }}
                  className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Remove Photo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Right Preview */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center bg-gray-100/70 dark:bg-slate-950/60 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 min-h-[440px] relative">
              <div className="max-w-full max-h-[380px] flex items-center justify-center overflow-hidden rounded-xl shadow-xl border border-white dark:border-slate-700 bg-white dark:bg-slate-900 p-2">
                <img
                  src={imageSrc}
                  alt="Inspected Image Preview"
                  className="max-h-[350px] max-w-full object-contain rounded-lg"
                />
              </div>

              <div className="mt-5 text-xs text-gray-500 dark:text-gray-400 text-center">
                Resolution: <strong className="text-royalBlue font-mono">{widthPx} × {heightPx} px</strong> ({getAspectRatioFraction(widthPx, heightPx)})
              </div>
            </div>
          </div>
        )}
      </div>

      <AdSenseUnit placementLabel="Dimensions Checker Bottom Banner" />

      {/* Guide */}
      <div className="max-w-5xl mx-auto mt-12 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <HelpCircle size={20} className="text-royalBlue" />
          Standard Dimensions for Common Use Cases
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">1</span>
              Passport & Visa Photo
            </div>
            <p className="text-xs">Standard passport photo is <strong>350 × 450 px</strong> (or 413 × 531 px at 300 DPI) with 3:4 aspect ratio. US Visa is <strong>600 × 600 px</strong> (1:1).</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">2</span>
              Online Signature Scans
            </div>
            <p className="text-xs">Standard government application signature size is <strong>140 × 60 px</strong> (or 160 × 70 px) with wide horizontal ratio (~7:3).</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">3</span>
              Social Media Avatars
            </div>
            <p className="text-xs">Instagram, Twitter/X, and LinkedIn avatars require square <strong>1:1</strong> aspect ratio, ideally <strong>400 × 400 px</strong> or higher.</p>
          </div>
        </div>
      </div>

      <SuggestedTools currentToolId="image-dimensions-checker" onNavigate={onNavigateToTool} />
    </div>
  );
};

export default ImageDimensionsChecker;
