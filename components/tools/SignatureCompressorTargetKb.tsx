import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  FileCheck,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface SignatureCompressorTargetKbProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const SignatureCompressorTargetKb: React.FC<SignatureCompressorTargetKbProps> = ({
  onNavigateHome,
  onNavigateToTool,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [origSizeKb, setOrigSizeKb] = useState<number>(0);
  const [origDims, setOrigDims] = useState<{ w: number; h: number } | null>(null);

  // Settings
  const [targetKb, setTargetKb] = useState<number>(10); // 10 KB default for IBPS/SSC
  const [inkBoost, setInkBoost] = useState<boolean>(true);
  const [cleanWhitePaper, setCleanWhitePaper] = useState<boolean>(true);

  // Result
  const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
  const [compressedSizeKb, setCompressedSizeKb] = useState<number>(0);
  const [compressedDims, setCompressedDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        toast.success(`Signature loaded (${kb} KB). Compressing under ${targetKb} KB...`);
      };
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!imageSrc) return;
    compressSignature();
  }, [imageSrc, targetKb, inkBoost, cleanWhitePaper]);

  const compressSignature = async () => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc!;
    await new Promise((res) => (img.onload = res));

    let scale = 1.0;
    // For signatures, max resolution usually 140x60 or 280x120
    if (img.width > 600) {
      scale = 600 / img.width;
    }

    const maxSizeBytes = targetKb * 1024;
    let bestBlob: Blob | null = null;
    let finalW = Math.round(img.width * scale);
    let finalH = Math.round(img.height * scale);

    for (let pass = 0; pass < 3; pass++) {
      const canvas = document.createElement('canvas');
      canvas.width = finalW;
      canvas.height = finalH;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) break;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, finalW, finalH);
      ctx.drawImage(img, 0, 0, finalW, finalH);

      // Clean background and boost ink
      if (cleanWhitePaper || inkBoost) {
        const imgData = ctx.getImageData(0, 0, finalW, finalH);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const brightness = (r + g + b) / 3;

          if (cleanWhitePaper && brightness > 185) {
            // Off-white paper cast turned to pure white
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
          } else if (inkBoost && brightness < 170) {
            // Darken ink stroke
            data[i] = Math.max(0, Math.round(r * 0.7));
            data[i + 1] = Math.max(0, Math.round(g * 0.7));
            data[i + 2] = Math.max(0, Math.round(b * 0.7));
          }
        }
        ctx.putImageData(imgData, 0, 0);
      }

      // Binary search JPEG quality
      let minQ = 0.05;
      let maxQ = 0.95;

      for (let iter = 0; iter < 7; iter++) {
        const midQ = (minQ + maxQ) / 2;
        const blob: Blob | null = await new Promise((res) =>
          canvas.toBlob(res, 'image/jpeg', midQ)
        );

        if (!blob) break;

        if (blob.size <= maxSizeBytes) {
          bestBlob = blob;
          minQ = midQ;
        } else {
          maxQ = midQ;
        }
      }

      if (bestBlob && bestBlob.size <= maxSizeBytes) {
        break;
      } else {
        // Downscale
        scale *= 0.8;
        finalW = Math.round(img.width * scale);
        finalH = Math.round(img.height * scale);
      }
    }

    if (bestBlob) {
      const url = URL.createObjectURL(bestBlob);
      const kb = Math.round((bestBlob.size / 1024) * 10) / 10;
      setCompressedUrl(url);
      setCompressedSizeKb(kb);
      setCompressedDims({ w: finalW, h: finalH });
    }
    setIsProcessing(false);
  };

  const handleDownload = () => {
    if (!compressedUrl) return;
    const link = document.createElement('a');
    link.href = compressedUrl;
    link.download = `signature-compressed-${compressedSizeKb}kb.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Signature (${compressedSizeKb} KB) downloaded!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
          <PenTool size={14} />
          <span>Standalone Signature Compressor Tool</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Signature <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Compressor to Target KB</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Compress ink signatures strictly under 10 KB or 20 KB with paper whitening and stroke clarity boost for government portals.
        </p>
      </div>

      <AdSenseUnit placementLabel="Signature Compressor Top Banner" />

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
                <PenTool size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Upload signature photo to compress
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Compress precisely to 10 KB, 15 KB, or 20 KB with auto shadow cleanup.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Target ≤ 10 KB (IBPS / SSC)
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  Clean White Paper
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  Dark Blue / Black Ink Boost
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
            {/* Left Controls */}
            <div className="lg:col-span-5 space-y-6">
              {/* Presets */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Target Signature Size
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 15, 20].map((kb) => (
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
                        {kb === 10 ? 'SSC/IBPS Exact' : kb === 15 ? 'State PSC' : 'UPSC/Gate'}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-3 bg-gray-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-gray-200 dark:border-slate-700">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1.5">
                    <span>Custom Target Limit</span>
                    <span className="font-bold font-mono text-emerald-600">{targetKb} KB</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="1"
                    value={targetKb}
                    onChange={(e) => setTargetKb(parseInt(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              {/* Ink & Paper Enhancements */}
              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                  Signature Enhancement
                </span>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cleanWhitePaper}
                    onChange={(e) => setCleanWhitePaper(e.target.checked)}
                    className="rounded-md accent-emerald-600"
                  />
                  <span>Remove greyish paper shadow & background noise</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inkBoost}
                    onChange={(e) => setInkBoost(e.target.checked)}
                    className="rounded-md accent-emerald-600"
                  />
                  <span>Deepen ink stroke contrast (Black / Blue pen)</span>
                </label>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={!compressedUrl || isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <Download size={18} />
                  <span>Download {compressedSizeKb} KB Signature</span>
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
                  Compressed Signature ({compressedSizeKb} KB)
                </span>
                {isProcessing && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <RefreshCw size={10} className="animate-spin" /> Compressing
                  </span>
                )}
              </div>

              <div className="max-w-full max-h-[380px] flex items-center justify-center overflow-hidden rounded-xl shadow-xl border border-white dark:border-slate-700 bg-white p-4">
                {compressedUrl ? (
                  <img
                    src={compressedUrl}
                    alt="Compressed Signature Preview"
                    className="max-h-[320px] max-w-full object-contain"
                  />
                ) : (
                  <div className="text-gray-400 flex items-center gap-2">
                    <RefreshCw size={18} className="animate-spin" /> Optimizing signature...
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center gap-3 text-xs bg-white/80 dark:bg-slate-900/80 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-800">
                <span>
                  Original: <strong className="text-gray-700 dark:text-gray-200 font-mono">{origSizeKb} KB</strong>
                </span>
                <span>→</span>
                <span>
                  Result: <strong className="text-emerald-600 font-mono">{compressedSizeKb} KB</strong> (≤ {targetKb} KB)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <AdSenseUnit placementLabel="Signature Compressor Bottom Banner" />

      {/* Guide */}
      <div className="max-w-5xl mx-auto mt-12 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <HelpCircle size={20} className="text-emerald-600" />
          Signature Requirements for Government Job Portals
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">1</span>
              10 KB to 20 KB Limit
            </div>
            <p className="text-xs">Portals like SSC, IBPS, and Railway RRB reject signatures exceeding 20 KB or below 10 KB. Our compressor targets this exact window.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">2</span>
              White Paper with Black/Blue Ink
            </div>
            <p className="text-xs">Signatures must be made on clean white unruled paper using a black or blue ballpoint pen. Mobile camera shadows are automatically removed.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">3</span>
              140 × 60 Pixel Standard
            </div>
            <p className="text-xs">Dimensions are kept proportional to prevent stretching or distortion of your signature on your admit card.</p>
          </div>
        </div>
      </div>

      <SuggestedTools currentToolId="signature-compressor-target-kb" onNavigate={onNavigateToTool} />
    </div>
  );
};

export default SignatureCompressorTargetKb;
