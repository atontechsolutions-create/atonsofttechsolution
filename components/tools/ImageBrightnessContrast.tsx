import React, { useState, useRef, useEffect } from 'react';
import {
  Sun,
  Contrast,
  Sliders,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  Eye,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface ImageBrightnessContrastProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const ImageBrightnessContrast: React.FC<ImageBrightnessContrastProps> = ({
  onNavigateHome,
  onNavigateToTool,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [origSizeKb, setOrigSizeKb] = useState<number>(0);

  // Sliders
  const [brightness, setBrightness] = useState<number>(100); // 0 to 200
  const [contrast, setContrast] = useState<number>(100); // 0 to 200
  const [saturation, setSaturation] = useState<number>(100); // 0 to 200
  const [warmth, setWarmth] = useState<number>(0); // -50 to +50

  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedSizeKb, setProcessedSizeKb] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setSelectedFile(file);
      setOrigSizeKb(Math.round(file.size / 1024));
      resetSliders();
      toast.success('Image loaded! Adjust brightness & contrast below.');
    };
    reader.readAsDataURL(file);
  };

  const resetSliders = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setWarmth(0);
  };

  const applyAutoEnhance = () => {
    setBrightness(115);
    setContrast(120);
    setSaturation(110);
    setWarmth(5);
    toast.success('Applied Auto Brightness & Face Enhancement');
  };

  const applyFixDark = () => {
    setBrightness(135);
    setContrast(110);
    setSaturation(105);
    setWarmth(0);
    toast.success('Dark photo boosted');
  };

  useEffect(() => {
    if (!imageSrc) return;
    renderAdjustedImage();
  }, [imageSrc, brightness, contrast, saturation, warmth]);

  const renderAdjustedImage = () => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc!;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Apply CSS-like filter properties via canvas ctx.filter
      const bFilter = brightness / 100;
      const cFilter = contrast / 100;
      const sFilter = saturation / 100;

      ctx.filter = `brightness(${bFilter}) contrast(${cFilter}) saturate(${sFilter})`;
      ctx.drawImage(img, 0, 0);

      // Warmth tint if set
      if (warmth !== 0) {
        ctx.filter = 'none';
        ctx.fillStyle = warmth > 0 ? `rgba(255, 140, 0, ${Math.abs(warmth) * 0.003})` : `rgba(0, 100, 255, ${Math.abs(warmth) * 0.003})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setProcessedUrl(URL.createObjectURL(blob));
            setProcessedSizeKb(Math.round(blob.size / 1024));
          }
          setIsProcessing(false);
        },
        'image/jpeg',
        0.95
      );
    };
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = `photo-enhanced-b${brightness}-c${contrast}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Enhanced photo downloaded!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-100/80 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800 mb-3">
          <Sun size={14} />
          <span>Standalone Brightness & Contrast Adjuster</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Image <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Brightness & Contrast</span> Adjuster
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Fix underexposed, dark, or washed-out photographs with real-time sliders for brightness, contrast, saturation, and color warmth.
        </p>
      </div>

      <AdSenseUnit placementLabel="Brightness Adjuster Top Banner" />

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
              className="border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-amber-500 rounded-3xl p-10 sm:p-16 cursor-pointer transition-all bg-gray-50/60 dark:bg-slate-800/40 hover:bg-amber-50/40 group flex flex-col items-center justify-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
                <Sun size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Upload dark or low-contrast photo
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Brighten facial features and improve contrast to meet strict official ID clarity specifications.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                  Fix Underexposed Photos
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  Boost Face Contrast
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  Real-Time Sliders
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
            {/* Left Controls */}
            <div className="lg:col-span-5 space-y-6">
              {/* Quick Preset Buttons */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  1-Click Presets
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={applyAutoEnhance}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-amber-500 bg-gray-50 dark:bg-slate-800 text-xs font-semibold text-gray-900 dark:text-white transition-all"
                  >
                    Auto Enhance
                  </button>
                  <button
                    onClick={applyFixDark}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-amber-500 bg-gray-50 dark:bg-slate-800 text-xs font-semibold text-gray-900 dark:text-white transition-all"
                  >
                    Fix Dark Photo
                  </button>
                  <button
                    onClick={resetSliders}
                    className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-amber-500 bg-gray-50 dark:bg-slate-800 text-xs font-semibold text-gray-500 transition-all flex items-center justify-center gap-1"
                  >
                    <RotateCcw size={12} /> Reset
                  </button>
                </div>
              </div>

              {/* Sliders */}
              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-4">
                {/* Brightness */}
                <div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Sun size={13} className="text-amber-500" /> Brightness
                    </span>
                    <span className="font-mono font-bold text-amber-600">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="180"
                    value={brightness}
                    onChange={(e) => setBrightness(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                {/* Contrast */}
                <div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Contrast size={13} className="text-amber-500" /> Contrast
                    </span>
                    <span className="font-mono font-bold text-amber-600">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="180"
                    value={contrast}
                    onChange={(e) => setContrast(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                </div>

                {/* Saturation */}
                <div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Color Saturation</span>
                    <span className="font-mono font-bold text-amber-600">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    value={saturation}
                    onChange={(e) => setSaturation(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                    <span>0% (B&W)</span>
                    <span>100% Normal</span>
                    <span>200% Vivid</span>
                  </div>
                </div>

                {/* Warmth */}
                <div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Color Temperature (Warmth)</span>
                    <span className="font-mono font-bold text-amber-600">
                      {warmth > 0 ? `+${warmth}` : warmth}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-40"
                    max="40"
                    value={warmth}
                    onChange={(e) => setWarmth(parseInt(e.target.value))}
                    className="w-full accent-amber-500"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                    <span>Cool Blue</span>
                    <span>Neutral</span>
                    <span>Warm Amber</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={!processedUrl || isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <Download size={18} />
                  <span>Download Enhanced Photo ({processedSizeKb} KB)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onMouseDown={() => setShowOriginal(true)}
                    onMouseUp={() => setShowOriginal(false)}
                    onTouchStart={() => setShowOriginal(true)}
                    onTouchEnd={() => setShowOriginal(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors select-none"
                  >
                    <Eye size={14} />
                    <span>Hold for Original</span>
                  </button>
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
            <div className="lg:col-span-7 flex flex-col items-center justify-center bg-gray-100/70 dark:bg-slate-950/60 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 min-h-[440px] relative">
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/90 dark:bg-slate-800/90 text-gray-700 dark:text-gray-300 shadow-xs border border-gray-200 dark:border-slate-700">
                  {showOriginal ? 'Original Photo' : 'Enhanced Preview'}
                </span>
                {isProcessing && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-amber-100 text-amber-800 flex items-center gap-1">
                    <RefreshCw size={10} className="animate-spin" /> Rendering
                  </span>
                )}
              </div>

              <div className="max-w-full max-h-[380px] flex items-center justify-center overflow-hidden rounded-xl shadow-xl border border-white dark:border-slate-700 bg-white dark:bg-slate-900 p-2">
                {showOriginal ? (
                  <img
                    src={imageSrc}
                    alt="Original Photo"
                    className="max-h-[350px] max-w-full object-contain rounded-lg"
                  />
                ) : processedUrl ? (
                  <img
                    src={processedUrl}
                    alt="Enhanced Preview"
                    className="max-h-[350px] max-w-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-gray-400 flex items-center gap-2">
                    <RefreshCw size={18} className="animate-spin" /> Adjusting photo...
                  </div>
                )}
              </div>

              <div className="mt-5 text-xs text-gray-500 dark:text-gray-400 text-center">
                Brightness: <strong className="text-amber-600 font-mono">{brightness}%</strong> • Contrast: <strong className="text-amber-600 font-mono">{contrast}%</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      <AdSenseUnit placementLabel="Brightness Adjuster Bottom Banner" />

      {/* Guide */}
      <div className="max-w-5xl mx-auto mt-12 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <HelpCircle size={20} className="text-amber-600" />
          Why Brightness & Contrast Matter for Government Forms
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs">1</span>
              Clear Facial Features
            </div>
            <p className="text-xs">Exams like SSC and IBPS explicitly mandate that eyes, nose, lips, and both ears must be clearly distinguishable without heavy shadows under the chin.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs">2</span>
              Avoid Washed Out Glare
            </div>
            <p className="text-xs">If an over-bright flashlight was used during your portrait, reducing brightness and increasing contrast recovers definition in white shirts and forehead highlights.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-xs">3</span>
              Admit Card Verification
            </div>
            <p className="text-xs">Admit card photos are printed in low-resolution thermal/grayscale at exam centers. Higher contrast ensures the invigilator verifies your face smoothly.</p>
          </div>
        </div>
      </div>

      <SuggestedTools currentToolId="image-brightness-adjuster" onNavigate={onNavigateToTool} />
    </div>
  );
};

export default ImageBrightnessContrast;
