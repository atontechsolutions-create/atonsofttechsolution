import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  Upload,
  Download,
  Trash2,
  Lock,
  Unlock,
  RefreshCw,
  Sparkles,
  Maximize2,
  CheckCircle2,
  HelpCircle,
  FileCheck,
  Sliders,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface DimensionPreset {
  id: string;
  name: string;
  w: number;
  h: number;
  unit: 'px' | 'cm' | 'mm' | 'in';
  desc: string;
}

const PHOTO_PRESETS: DimensionPreset[] = [
  { id: 'custom', name: 'Custom Size', w: 350, h: 450, unit: 'px', desc: 'Set your own custom dimensions' },
  { id: 'passport-in', name: 'Passport (3.5 × 4.5 cm)', w: 3.5, h: 4.5, unit: 'cm', desc: 'Standard passport & visa ratio' },
  { id: 'passport-us', name: 'US Visa / 2×2 in', w: 2, h: 2, unit: 'in', desc: 'Standard 2x2 inch square' },
  { id: 'govt-exam', name: 'Govt Exam (200 × 230 px)', w: 200, h: 230, unit: 'px', desc: 'Standard SSC / UPSC photo size' },
  { id: 'square-600', name: 'Square Profile (600 × 600 px)', w: 600, h: 600, unit: 'px', desc: 'Social media & resume avatar' },
  { id: 'postcard-4x6', name: 'Print Photo (4 × 6 in)', w: 4, h: 6, unit: 'in', desc: 'Standard lab photo print' },
];

interface PhotoResizerProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const PhotoResizer: React.FC<PhotoResizerProps> = ({ onNavigateHome, onNavigateToTool }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [origDims, setOrigDims] = useState<{ w: number; h: number } | null>(null);
  const [origSizeKb, setOrigSizeKb] = useState<number>(0);

  // Unit and Dimensions
  const [unit, setUnit] = useState<'px' | 'cm' | 'mm' | 'in'>('px');
  const [targetWidth, setTargetWidth] = useState<number>(350);
  const [targetHeight, setTargetHeight] = useState<number>(450);
  const [lockAspect, setLockAspect] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(350 / 450);
  const [dpi, setDpi] = useState<number>(300);

  // Quality & Format
  const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState<number>(90); // 1-100

  // Output
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedSizeKb, setProcessedSizeKb] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Unit conversion to px
  const toPixels = (val: number, u: 'px' | 'cm' | 'mm' | 'in', d: number): number => {
    switch (u) {
      case 'in':
        return Math.round(val * d);
      case 'cm':
        return Math.round((val / 2.54) * d);
      case 'mm':
        return Math.round((val / 25.4) * d);
      case 'px':
      default:
        return Math.round(val);
    }
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
      setOrigSizeKb(Math.round(file.size / 1024));

      const img = new Image();
      img.src = src;
      img.onload = () => {
        setOrigDims({ w: img.width, h: img.height });
        setTargetWidth(img.width);
        setTargetHeight(img.height);
        setUnit('px');
        setAspectRatio(img.width / img.height);
        toast.success('Photo loaded successfully!');
      };
    };
    reader.readAsDataURL(file);
  };

  const handleWidthChange = (val: number) => {
    setTargetWidth(val);
    if (lockAspect && aspectRatio > 0) {
      setTargetHeight(Math.round(val / aspectRatio));
    }
  };

  const handleHeightChange = (val: number) => {
    setTargetHeight(val);
    if (lockAspect && aspectRatio > 0) {
      setTargetWidth(Math.round(val * aspectRatio));
    }
  };

  const applyPreset = (preset: DimensionPreset) => {
    setUnit(preset.unit);
    setTargetWidth(preset.w);
    setTargetHeight(preset.h);
    setAspectRatio(preset.w / preset.h);
    toast.success(`Applied ${preset.name}`);
  };

  // Perform resize
  useEffect(() => {
    if (!imageSrc) return;
    processResize();
  }, [imageSrc, targetWidth, targetHeight, unit, dpi, format, quality]);

  const processResize = () => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc!;
    img.onload = () => {
      const finalW = Math.max(10, toPixels(targetWidth, unit, dpi));
      const finalH = Math.max(10, toPixels(targetHeight, unit, dpi));

      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = finalW;
      canvas.height = finalH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clean fill for transparency
      if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, finalW, finalH);
      } else {
        ctx.clearRect(0, 0, finalW, finalH);
      }

      // Smooth resizing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, finalW, finalH);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setProcessedUrl(url);
            setProcessedSizeKb(Math.round(blob.size / 1024));
          }
          setIsProcessing(false);
        },
        format,
        quality / 100
      );
    };
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = `photo-resized-${toPixels(targetWidth, unit, dpi)}x${toPixels(targetHeight, unit, dpi)}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Resized photo downloaded!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-100/80 text-royalBlue dark:bg-royalBlue/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-3">
          <ImageIcon size={14} />
          <span>Standalone Photo Resizer Tool</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Online <span className="text-transparent bg-clip-text bg-gradient-to-r from-royalBlue to-blue-500">Photo Resizer</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Resize portrait, passport, and profile photos to exact pixel dimensions, centimeters, or inches with aspect-ratio locking and zero blur.
        </p>
      </div>

      <AdSenseUnit placementLabel="Photo Resizer Top Banner" />

      {/* Main Container */}
      <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
        {!imageSrc ? (
          /* Upload State */
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
              className="border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-royalBlue dark:hover:border-blue-500 rounded-3xl p-10 sm:p-16 cursor-pointer transition-all bg-gray-50/60 dark:bg-slate-800/40 hover:bg-blue-50/40 dark:hover:bg-slate-800/80 group flex flex-col items-center justify-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-royalBlue dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
                <Upload size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Click to upload photo or drag & drop
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Supports JPG, PNG, and WebP images. Works 100% locally in your browser — your private photo never leaves your device.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  Passport Sizes
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  Job Portals
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  Exact Pixels & CM
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Editor State */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
            {/* Left Controls */}
            <div className="lg:col-span-5 space-y-6">
              {/* Preset Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Popular Photo Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PHOTO_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => applyPreset(p)}
                      className="text-left p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-royalBlue dark:hover:border-blue-500 bg-gray-50 dark:bg-slate-800/70 text-xs transition-all hover:shadow-sm"
                    >
                      <div className="font-semibold text-gray-900 dark:text-white truncate">{p.name}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Units & Dimensions */}
              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Dimensions</span>
                  <div className="inline-flex rounded-lg border border-gray-200 dark:border-slate-700 p-0.5 bg-white dark:bg-slate-800">
                    {(['px', 'cm', 'mm', 'in'] as const).map((u) => (
                      <button
                        key={u}
                        onClick={() => setUnit(u)}
                        className={`px-2 py-0.5 text-xs font-semibold rounded-md uppercase transition-all ${
                          unit === u
                            ? 'bg-royalBlue text-white shadow-xs'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Width ({unit})</label>
                    <input
                      type="number"
                      value={targetWidth}
                      onChange={(e) => handleWidthChange(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-royalBlue font-mono font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Height ({unit})</label>
                    <input
                      type="number"
                      value={targetHeight}
                      onChange={(e) => handleHeightChange(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-royalBlue font-mono font-semibold"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-slate-700">
                  <button
                    onClick={() => {
                      setLockAspect(!lockAspect);
                      if (!lockAspect) setAspectRatio(targetWidth / targetHeight);
                    }}
                    className="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 hover:text-royalBlue transition-colors"
                  >
                    {lockAspect ? <Lock size={14} className="text-royalBlue" /> : <Unlock size={14} />}
                    <span>{lockAspect ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}</span>
                  </button>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                    Pixels: {toPixels(targetWidth, unit, dpi)} × {toPixels(targetHeight, unit, dpi)} px
                  </span>
                </div>
              </div>

              {/* Format & Quality */}
              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-800 dark:text-gray-200">Format & Quality</span>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value as any)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                  >
                    <option value="image/jpeg">JPG (Standard)</option>
                    <option value="image/png">PNG (Lossless)</option>
                    <option value="image/webp">WebP (Modern)</option>
                  </select>
                </div>

                {format !== 'image/png' && (
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Compression Quality</span>
                      <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{quality}%</span>
                    </div>
                    <input
                      type="range"
                      min={10}
                      max={100}
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value))}
                      className="w-full accent-royalBlue"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={!processedUrl || isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-white bg-gradient-to-r from-royalBlue to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <Download size={18} />
                  <span>Download Resized Photo ({processedSizeKb} KB)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <Upload size={14} />
                    <span>Change Photo</span>
                  </button>
                  <button
                    onClick={() => {
                      setImageSrc(null);
                      setSelectedFile(null);
                      setProcessedUrl(null);
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
            <div className="lg:col-span-7 flex flex-col items-center justify-center bg-gray-100/70 dark:bg-slate-950/60 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 min-h-[420px] relative">
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/90 dark:bg-slate-800/90 text-gray-700 dark:text-gray-300 shadow-xs border border-gray-200 dark:border-slate-700">
                  Live Preview
                </span>
                {isProcessing && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-100 text-amber-800 flex items-center gap-1">
                    <RefreshCw size={10} className="animate-spin" /> Processing
                  </span>
                )}
              </div>

              {/* Preview Canvas Display */}
              <div className="max-w-full max-h-[380px] flex items-center justify-center overflow-hidden rounded-xl shadow-lg border border-white dark:border-slate-700 bg-white dark:bg-slate-900 p-2">
                {processedUrl ? (
                  <img
                    src={processedUrl}
                    alt="Resized Preview"
                    className="max-h-[350px] max-w-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-gray-400 flex items-center gap-2">
                    <RefreshCw size={18} className="animate-spin" /> Rendering preview...
                  </div>
                )}
              </div>

              {/* Meta stats bar */}
              {origDims && (
                <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-slate-900/80 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-800">
                  <span>
                    Original: <strong className="text-gray-700 dark:text-gray-200 font-mono">{origDims.w}×{origDims.h} px</strong> ({origSizeKb} KB)
                  </span>
                  <span>→</span>
                  <span>
                    Target: <strong className="text-royalBlue font-mono">{toPixels(targetWidth, unit, dpi)}×{toPixels(targetHeight, unit, dpi)} px</strong> ({processedSizeKb} KB)
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AdSenseUnit placementLabel="Photo Resizer Bottom Banner" />

      {/* Guide & Instructions */}
      <div className="max-w-5xl mx-auto mt-12 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <HelpCircle size={20} className="text-royalBlue" />
          How to Resize Photos with Exact Dimensions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">1</span>
              Upload Portrait Photo
            </div>
            <p className="text-xs">Select any portrait photo from your computer, phone, or tablet. Your original image stays on your local device.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">2</span>
              Choose Unit & Size
            </div>
            <p className="text-xs">Pick pixels (px), centimeters (cm), or inches (in). Use preset shortcuts like 3.5×4.5 cm for passport forms.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">3</span>
              Instant Download
            </div>
            <p className="text-xs">Preview the exact output dimensions and file weight in real-time, then download your crisp resized image.</p>
          </div>
        </div>
      </div>

      <SuggestedTools currentToolId="photo-resizer" onNavigate={onNavigateToTool} />
    </div>
  );
};

export default PhotoResizer;
