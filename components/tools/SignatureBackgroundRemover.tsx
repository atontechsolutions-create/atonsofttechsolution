import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Eye,
  Crop,
  Sparkles,
  Layers,
  FileCheck,
  Check,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface InkColorPreset {
  id: string;
  name: string;
  color: string;
  rgb: [number, number, number];
}

const INK_PRESETS: InkColorPreset[] = [
  { id: 'original', name: 'Original Ink', color: '#1E293B', rgb: [30, 41, 59] },
  { id: 'deep-black', name: 'Deep Black Ink', color: '#0A0A0A', rgb: [10, 10, 10] },
  { id: 'royal-blue', name: 'Royal Blue (Official)', color: '#0047AB', rgb: [0, 71, 171] },
  { id: 'navy-blue', name: 'Navy Blue Ink', color: '#001F3F', rgb: [0, 31, 63] },
];

interface SignatureBackgroundRemoverProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const SignatureBackgroundRemover: React.FC<SignatureBackgroundRemoverProps> = ({
  onNavigateHome,
  onNavigateToTool,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [originalSizeKb, setOriginalSizeKb] = useState<number>(0);

  // Settings
  const [threshold, setThreshold] = useState<number>(205); // 120 - 245
  const [inkBoost, setInkBoost] = useState<number>(1.25); // 1.0 - 2.5
  const [inkColor, setInkColor] = useState<string>('original');
  const [bgMode, setBgMode] = useState<'transparent' | 'white'>('transparent');
  const [autoCrop, setAutoCrop] = useState<boolean>(true);
  const [smoothness, setSmoothness] = useState<number>(1); // 0 to 3

  // Result
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedBlob, setProcessedBlob] = useState<Blob | null>(null);
  const [processedSizeKb, setProcessedSizeKb] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setSelectedFile(file);
      setOriginalSizeKb(Math.round(file.size / 1024));
      toast.success('Signature photo loaded! Cleaning background...');
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!imageSrc) return;
    processSignature();
  }, [imageSrc, threshold, inkBoost, inkColor, bgMode, autoCrop, smoothness]);

  const processSignature = () => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc!;
    img.onload = () => {
      // Step 1: Draw on working canvas
      const workCanvas = document.createElement('canvas');
      workCanvas.width = img.width;
      workCanvas.height = img.height;
      const ctx = workCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, workCanvas.width, workCanvas.height);
      const data = imgData.data;
      const w = workCanvas.width;
      const h = workCanvas.height;

      const selectedPreset = INK_PRESETS.find((p) => p.id === inkColor);

      // Track bounding box for auto-crop
      let minX = w;
      let minY = h;
      let maxX = 0;
      let maxY = 0;
      let inkPixelCount = 0;

      // Extract ink and remove background
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const pixelIndex = i / 4;
        const px = pixelIndex % w;
        const py = Math.floor(pixelIndex / w);

        // Perceived luminance
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;

        if (lum < threshold) {
          // It's ink!
          inkPixelCount++;
          if (px < minX) minX = px;
          if (px > maxX) maxX = px;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;

          // Compute normalized ink intensity (0.0 = dark ink, 1.0 = light paper edge)
          const inkFactor = Math.max(0, (threshold - lum) / threshold);
          const alpha = Math.min(255, Math.round(Math.pow(inkFactor, 1 / inkBoost) * 255));

          if (selectedPreset && selectedPreset.id !== 'original') {
            data[i] = selectedPreset.rgb[0];
            data[i + 1] = selectedPreset.rgb[1];
            data[i + 2] = selectedPreset.rgb[2];
          } else {
            // Darken original ink slightly for legibility
            data[i] = Math.max(0, Math.round(r * (1 - (1 - lum / 255) * 0.4)));
            data[i + 1] = Math.max(0, Math.round(g * (1 - (1 - lum / 255) * 0.4)));
            data[i + 2] = Math.max(0, Math.round(b * (1 - (1 - lum / 255) * 0.4)));
          }

          if (bgMode === 'transparent') {
            data[i + 3] = alpha;
          } else {
            // Pure white background: blend ink onto white
            const invA = 1 - alpha / 255;
            data[i] = Math.round(data[i] * (alpha / 255) + 255 * invA);
            data[i + 1] = Math.round(data[i + 1] * (alpha / 255) + 255 * invA);
            data[i + 2] = Math.round(data[i + 2] * (alpha / 255) + 255 * invA);
            data[i + 3] = 255;
          }
        } else {
          // Paper background
          if (bgMode === 'transparent') {
            data[i + 3] = 0; // Fully transparent
          } else {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
            data[i + 3] = 255; // Pure white
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Final canvas
      let finalCanvas = workCanvas;

      // Auto-Crop with margin if signature was found
      if (autoCrop && inkPixelCount > 20 && maxX > minX && maxY > minY) {
        const padding = Math.max(16, Math.round(Math.min(w, h) * 0.05));
        const cropX = Math.max(0, minX - padding);
        const cropY = Math.max(0, minY - padding);
        const cropW = Math.min(w - cropX, maxX - minX + padding * 2);
        const cropH = Math.min(h - cropY, maxY - minY + padding * 2);

        const croppedCanvas = document.createElement('canvas');
        croppedCanvas.width = cropW;
        croppedCanvas.height = cropH;
        const cropCtx = croppedCanvas.getContext('2d');
        if (cropCtx) {
          if (bgMode === 'white') {
            cropCtx.fillStyle = '#FFFFFF';
            cropCtx.fillRect(0, 0, cropW, cropH);
          }
          cropCtx.drawImage(workCanvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
          finalCanvas = croppedCanvas;
        }
      }

      const mimeType = bgMode === 'transparent' ? 'image/png' : 'image/jpeg';
      finalCanvas.toBlob(
        (blob) => {
          if (blob) {
            setProcessedBlob(blob);
            setProcessedUrl(URL.createObjectURL(blob));
            setProcessedSizeKb(Math.round(blob.size / 1024));
          }
          setIsProcessing(false);
        },
        mimeType,
        0.96
      );
    };
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const ext = bgMode === 'transparent' ? 'png' : 'jpg';
    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = `clean-signature-${bgMode}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Signature downloaded as clean ${ext.toUpperCase()}!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
          <Sparkles size={14} />
          <span>Official Portal Signature Cleaner</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Signature <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Background Remover</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Remove paper texture, camera shadows, and yellow tints from handwritten signatures. Export as pure transparent PNG or 100% white background for UPSC, SSC, Bank & Passport uploads.
        </p>
      </div>

      <AdSenseUnit placementLabel="Signature Background Remover Top" />

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
                Upload Signature Photo or Scan
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Take a quick photo of your handwritten signature on paper. We automatically erase shadows, paper color, and blemishes.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Transparent PNG
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                  Pure White #FFFFFF
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                  Deep Black & Royal Blue Ink
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
            {/* Left Controls */}
            <div className="lg:col-span-5 space-y-6">
              {/* Output Background Mode */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Output Background Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setBgMode('transparent')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                      bgMode === 'transparent'
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100 shadow-xs'
                        : 'border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/40 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs sm:text-sm">Transparent PNG</span>
                      {bgMode === 'transparent' && <Check size={14} className="text-emerald-600" />}
                    </div>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      Zero paper background. Ideal for PDFs, documents & overlays.
                    </span>
                  </button>

                  <button
                    onClick={() => setBgMode('white')}
                    className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col justify-between ${
                      bgMode === 'white'
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100 shadow-xs'
                        : 'border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/40 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-extrabold text-xs sm:text-sm">Pure White JPG</span>
                      {bgMode === 'white' && <Check size={14} className="text-emerald-600" />}
                    </div>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400">
                      Standard 100% white background for UPSC, SSC & Bank portals.
                    </span>
                  </button>
                </div>
              </div>

              {/* Ink Enhancement */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Ink Color & Contrast
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {INK_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => setInkColor(preset.id)}
                      className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition cursor-pointer ${
                        inkColor === preset.id
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full border border-gray-300 shrink-0 shadow-xs"
                        style={{ backgroundColor: preset.color }}
                      />
                      <span className="truncate">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Threshold & Ink Boost Sliders */}
              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1 font-semibold">
                    <span>Paper Shadow Removal (Threshold)</span>
                    <span className="font-mono text-emerald-600 font-bold">{threshold}</span>
                  </div>
                  <input
                    type="range"
                    min="140"
                    max="235"
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                    <span>Lighter paper</span>
                    <span>Darker shadows</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1 font-semibold">
                    <span>Ink Darkness & Thickness Boost</span>
                    <span className="font-mono text-emerald-600 font-bold">{inkBoost.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="2.5"
                    step="0.05"
                    value={inkBoost}
                    onChange={(e) => setInkBoost(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Make faint or light ballpen strokes thick and crisp.
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCrop}
                      onChange={(e) => setAutoCrop(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Auto-Crop to Signature Borders</span>
                  </label>
                  <span className="text-[10px] text-emerald-600 font-bold">Recommended</span>
                </div>
              </div>

              {/* Download Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={!processedUrl || isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 cursor-pointer text-sm sm:text-base"
                >
                  <Download size={18} />
                  <span>Download Clean Signature ({processedSizeKb} KB)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onMouseDown={() => setShowOriginal(true)}
                    onMouseUp={() => setShowOriginal(false)}
                    onTouchStart={() => setShowOriginal(true)}
                    onTouchEnd={() => setShowOriginal(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition select-none"
                  >
                    <Eye size={14} />
                    <span>Hold to See Original</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition"
                  >
                    <Upload size={14} />
                    <span>Upload New</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Live Preview */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              <div className="w-full flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-gray-800 dark:text-gray-200">Live Preview:</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                    {bgMode === 'transparent' ? 'Transparent Canvas' : 'Pure White #FFFFFF'}
                  </span>
                </div>
                <span className="text-gray-500">
                  Original: {originalSizeKb} KB ➔ Clean: {processedSizeKb} KB
                </span>
              </div>

              {/* Canvas Preview Area */}
              <div
                className={`relative w-full min-h-[300px] sm:min-h-[380px] rounded-3xl border-2 border-gray-200 dark:border-slate-700 flex items-center justify-center p-6 overflow-hidden transition-all ${
                  bgMode === 'transparent'
                    ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100/70 dark:bg-slate-900/90'
                    : 'bg-white shadow-inner'
                }`}
              >
                {isProcessing && (
                  <div className="absolute inset-0 z-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs flex items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 shadow-lg text-emerald-600 font-bold text-xs">
                      <RefreshCw size={15} className="animate-spin" />
                      Cleaning Signature...
                    </div>
                  </div>
                )}

                <img
                  src={showOriginal ? imageSrc! : processedUrl || imageSrc!}
                  alt="Signature Preview"
                  className="max-h-[320px] max-w-full object-contain transition-all duration-200 filter drop-shadow-sm"
                />

                {showOriginal && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/75 text-white text-xs font-bold backdrop-blur-sm shadow">
                    Viewing Original Paper Photo
                  </span>
                )}
              </div>

              {/* Comparison & Portal Compliance Notice */}
              <div className="w-full mt-4 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3 text-xs">
                <FileCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-emerald-950 dark:text-emerald-200">
                  <span className="font-extrabold block">Govt Portal & Exam Compliance:</span>
                  Official examination portals (UPSC, SSC, IBPS, Railways, NTA, Passport) require signatures on a clear white paper without shadows or gray mobile photography glare. This tool guarantees 100% compliance with pure background contrast.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto mt-12">
        <SuggestedTools
          currentToolId="signature-bg-remover"
          onNavigate={onNavigateHome}
          onNavigateToTool={onNavigateToTool}
        />
      </div>
    </div>
  );
};

export default SignatureBackgroundRemover;
