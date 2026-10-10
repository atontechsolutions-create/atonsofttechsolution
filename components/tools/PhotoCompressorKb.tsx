import React, { useState, useRef, useEffect } from 'react';
import {
  Minimize2,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  FileCheck,
  Sliders,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface PhotoCompressorKbProps {
  targetKbDefault?: number; // 20, 50, or 100
  titleOverride?: string;
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const PhotoCompressorKb: React.FC<PhotoCompressorKbProps> = ({
  targetKbDefault = 20,
  titleOverride,
  onNavigateHome,
  onNavigateToTool,
}) => {
  const [targetKb, setTargetKb] = useState<number>(targetKbDefault);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [origSizeKb, setOrigSizeKb] = useState<number>(0);
  const [origDims, setOrigDims] = useState<{ w: number; h: number } | null>(null);

  // Result
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedSizeKb, setCompressedSizeKb] = useState<number>(0);
  const [compressedDims, setCompressedDims] = useState<{ w: number; h: number } | null>(null);
  const [compressionRatio, setCompressionRatio] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // If prop changes
  useEffect(() => {
    setTargetKb(targetKbDefault);
  }, [targetKbDefault]);

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
      const kb = Math.round(file.size / 1024);
      setOrigSizeKb(kb);

      const img = new Image();
      img.src = src;
      img.onload = () => {
        setOrigDims({ w: img.width, h: img.height });
        toast.success(`Photo loaded (${kb} KB). Compressing to ≤ ${targetKb} KB...`);
      };
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!imageSrc) return;
    compressToTargetKb();
  }, [imageSrc, targetKb]);

  const compressToTargetKb = async () => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc!;
    await new Promise((res) => (img.onload = res));

    let minQ = 0.05;
    let maxQ = 0.98;
    let bestBlob: Blob | null = null;
    let scale = 1.0;

    const maxSizeBytes = targetKb * 1024;

    // Iterative canvas compression with binary search
    for (let pass = 0; pass < 3; pass++) {
      const canvas = document.createElement('canvas');
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) break;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      for (let iter = 0; iter < 7; iter++) {
        const midQ = (minQ + maxQ) / 2;
        const blob: Blob | null = await new Promise((res) =>
          canvas.toBlob(res, 'image/jpeg', midQ)
        );

        if (!blob) break;

        if (blob.size <= maxSizeBytes) {
          bestBlob = blob;
          minQ = midQ; // Try higher quality
        } else {
          maxQ = midQ; // Quality too big
        }
      }

      // If even lowest quality is larger than target KB, scale image down slightly
      if (bestBlob && bestBlob.size <= maxSizeBytes) {
        setCompressedDims({ w, h });
        break;
      } else {
        scale *= 0.75;
        minQ = 0.1;
        maxQ = 0.9;
      }
    }

    if (bestBlob) {
      const url = URL.createObjectURL(bestBlob);
      const kb = Math.round((bestBlob.size / 1024) * 10) / 10;
      setCompressedUrl(url);
      setCompressedSizeKb(kb);
      const reduction = Math.round(((origSizeKb - kb) / origSizeKb) * 100);
      setCompressionRatio(reduction > 0 ? reduction : 0);
    }
    setIsProcessing(false);
  };

  const handleDownload = () => {
    if (!compressedUrl) return;
    const link = document.createElement('a');
    link.href = compressedUrl;
    link.download = `photo-compressed-${compressedSizeKb}kb.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Photo (${compressedSizeKb} KB) downloaded!`);
  };

  const displayTitle =
    titleOverride ||
    (targetKb === 20
      ? 'Photo Compressor to 20 KB'
      : targetKb === 50
      ? 'Photo Compressor to 50 KB'
      : targetKb === 100
      ? 'Photo Compressor to 100 KB'
      : `Photo Compressor to ${targetKb} KB`);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
          <Minimize2 size={14} />
          <span>Strict Target KB Compressor</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {displayTitle}
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Compress your photograph strictly below {targetKb} KB without losing facial clarity for SSC, UPSC, Bank PO, and college admission portals.
        </p>
      </div>

      <AdSenseUnit placementLabel="Photo Compressor KB Top Banner" />

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
              className="border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-emerald-500 rounded-3xl p-10 sm:p-16 cursor-pointer transition-all bg-gray-50/60 dark:bg-slate-800/40 hover:bg-emerald-50/40 group flex flex-col items-center justify-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
                <Minimize2 size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Upload photo to compress to ≤ {targetKb} KB
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Guaranteed to stay within strict exam and recruitment file size limits without blurry face features.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Target: ≤ {targetKb} KB
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  Exam Portal Ready
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  100% In-Browser
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
            {/* Left Controls */}
            <div className="lg:col-span-5 space-y-6">
              {/* Target KB Selector Buttons */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Target File Size Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[20, 50, 100].map((kb) => (
                    <button
                      key={kb}
                      onClick={() => setTargetKb(kb)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        targetKb === kb
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 bg-gray-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="font-bold text-sm text-gray-900 dark:text-white">≤ {kb} KB</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {kb === 20 ? 'SSC / Bank' : kb === 50 ? 'UPSC / Police' : 'Resume / Web'}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom Slider */}
                <div className="mt-3 bg-gray-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-gray-200 dark:border-slate-700">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                    <span>Custom Target Size</span>
                    <span className="font-bold font-mono text-emerald-600">{targetKb} KB</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="200"
                    step="5"
                    value={targetKb}
                    onChange={(e) => setTargetKb(parseInt(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              {/* Status Box */}
              <div
                className={`p-4 rounded-2xl border ${
                  compressedSizeKb <= targetKb
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200'
                } flex items-start gap-3 text-xs`}
              >
                <CheckCircle2 size={18} className="shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <div className="font-bold">
                    {compressedSizeKb <= targetKb ? 'Target Limit Successfully Reached!' : 'Optimizing...'}
                  </div>
                  <div className="mt-0.5">
                    Your photo is now compressed to <strong>{compressedSizeKb} KB</strong> (Strictly ≤ {targetKb} KB requirement).
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={!compressedUrl || isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <Download size={18} />
                  <span>Download {compressedSizeKb} KB Photo</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <Upload size={14} />
                    <span>Upload Another</span>
                  </button>
                  <button
                    onClick={() => {
                      setImageSrc(null);
                      setSelectedFile(null);
                      setCompressedUrl(null);
                    }}
                    className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    title="Remove Photo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Live Preview */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center bg-gray-100/70 dark:bg-slate-950/60 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 min-h-[440px] relative">
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/90 dark:bg-slate-800/90 text-gray-700 dark:text-gray-300 shadow-xs border border-gray-200 dark:border-slate-700">
                  Compressed Result ({compressedSizeKb} KB)
                </span>
                {isProcessing && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <RefreshCw size={10} className="animate-spin" /> Optimizing
                  </span>
                )}
              </div>

              <div className="max-w-full max-h-[380px] flex items-center justify-center overflow-hidden rounded-xl shadow-xl border border-white dark:border-slate-700 bg-white dark:bg-slate-900 p-2">
                {compressedUrl ? (
                  <img
                    src={compressedUrl}
                    alt="Compressed Preview"
                    className="max-h-[350px] max-w-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-gray-400 flex items-center gap-2">
                    <RefreshCw size={18} className="animate-spin" /> Compressing to target size...
                  </div>
                )}
              </div>

              {/* Stats pill */}
              <div className="mt-5 flex items-center gap-3 text-xs bg-white/80 dark:bg-slate-900/80 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-800">
                <span>
                  Original: <strong className="text-gray-700 dark:text-gray-200 font-mono">{origSizeKb} KB</strong>
                </span>
                <span>→</span>
                <span>
                  Target: <strong className="text-emerald-600 font-mono">{compressedSizeKb} KB</strong>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  -{compressionRatio}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <AdSenseUnit placementLabel="Photo Compressor KB Bottom Banner" />

      {/* Guide */}
      <div className="max-w-5xl mx-auto mt-12 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <HelpCircle size={20} className="text-emerald-600" />
          Common Government Exam Photo Limits
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">1</span>
              SSC CGL / CHSL / GD
            </div>
            <p className="text-xs">Photo must be between <strong>20 KB to 50 KB</strong>. Photos above 50 KB or below 20 KB are instantly rejected by the online portal.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">2</span>
              IBPS Bank PO / Clerk
            </div>
            <p className="text-xs">Candidate photograph between <strong>20 KB to 50 KB</strong> in JPG format. Signature must be strictly <strong>10 KB to 20 KB</strong>.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">3</span>
              UPSC Civil Services & NDA
            </div>
            <p className="text-xs">Photo must not exceed <strong>300 KB</strong> and not be less than <strong>20 KB</strong> with clear 350×350 pixel minimum resolution.</p>
          </div>
        </div>
      </div>

      <SuggestedTools currentToolId={`photo-compressor-${targetKb}kb`} onNavigate={onNavigateToTool} />
    </div>
  );
};

export default PhotoCompressorKb;
