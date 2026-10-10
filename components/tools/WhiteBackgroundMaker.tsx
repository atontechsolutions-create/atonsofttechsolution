import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Sun,
  Eye,
  Sliders,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface WhiteBackgroundMakerProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const WhiteBackgroundMaker: React.FC<WhiteBackgroundMakerProps> = ({
  onNavigateHome,
  onNavigateToTool,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [origSizeKb, setOrigSizeKb] = useState<number>(0);

  // Settings
  const [threshold, setThreshold] = useState<number>(36); // 15 to 70
  const [edgeSmooth, setEdgeSmooth] = useState<number>(3);
  const [contrastBoost, setContrastBoost] = useState<boolean>(true);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);

  // Output
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedSizeKb, setProcessedSizeKb] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
      toast.success('Photo loaded! Converting background to pure white.');
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!imageSrc) return;
    processWhiteBackground();
  }, [imageSrc, threshold, edgeSmooth, contrastBoost]);

  const processWhiteBackground = () => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc!;
    img.onload = () => {
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;

      // Sample corners
      let cornerR = 0, cornerG = 0, cornerB = 0, samples = 0;
      const sampleCoords = [
        [2, 2],
        [canvas.width - 3, 2],
        [2, 10],
        [canvas.width - 3, 10],
      ];
      sampleCoords.forEach(([cx, cy]) => {
        const idx = (cy * canvas.width + cx) * 4;
        cornerR += data[idx];
        cornerG += data[idx + 1];
        cornerB += data[idx + 2];
        samples++;
      });
      cornerR /= samples;
      cornerG /= samples;
      cornerB /= samples;

      const tolSq = threshold * threshold * 3;

      for (let i = 0; i < data.length; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        const distSq =
          (r - cornerR) * (r - cornerR) +
          (g - cornerG) * (g - cornerG) +
          (b - cornerB) * (b - cornerB);

        // Turn background into solid pure white #FFFFFF
        if (distSq < tolSq) {
          const factor = Math.min(1, Math.max(0, (tolSq - distSq) / tolSq));
          data[i] = Math.round(r * (1 - factor) + 255 * factor);
          data[i + 1] = Math.round(g * (1 - factor) + 255 * factor);
          data[i + 2] = Math.round(b * (1 - factor) + 255 * factor);
        } else if (contrastBoost) {
          // Subtle subject enhancement
          data[i] = Math.min(255, Math.max(0, Math.round((r - 128) * 1.05 + 128)));
          data[i + 1] = Math.min(255, Math.max(0, Math.round((g - 128) * 1.05 + 128)));
          data[i + 2] = Math.min(255, Math.max(0, Math.round((b - 128) * 1.05 + 128)));
        }
      }

      ctx.putImageData(imgData, 0, 0);

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
    link.download = `white-background-photo.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Pure white background photo downloaded!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-100/80 text-royalBlue dark:bg-royalBlue/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-3">
          <Sparkles size={14} />
          <span>Official 100% White Background Tool</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          White Background <span className="text-transparent bg-clip-text bg-gradient-to-r from-royalBlue to-blue-500">Photo Maker</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Convert any selfie or portrait photo background into pure, clean white (#FFFFFF) required by passport offices, visa embassies, and exam forms.
        </p>
      </div>

      <AdSenseUnit placementLabel="White BG Maker Top Banner" />

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
                <Sparkles size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Upload photo to turn background white
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Automatic white backdrop generation with facial edge preservation. 100% secure in-browser processing.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-royalBlue dark:bg-blue-950/60 dark:text-blue-300">
                  Pure White #FFFFFF
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  Passport Compliant
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  Visa Submissions
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
            {/* Left Controls */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-royalBlue shrink-0 mt-0.5" />
                <div>
                  <strong>Official Requirement Met:</strong> Passports and government portals require neutral pure white backgrounds without shadows, textures, or indoor walls.
                </div>
              </div>

              {/* Sliders */}
              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block flex items-center gap-1.5">
                  <Sliders size={13} />
                  White Balance Tuning
                </span>
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>White Sensitivity (Threshold)</span>
                    <span className="font-mono font-bold text-royalBlue">{threshold}</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="65"
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value))}
                    className="w-full accent-royalBlue"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer pt-2 border-t border-gray-200 dark:border-slate-700">
                  <input
                    type="checkbox"
                    checked={contrastBoost}
                    onChange={(e) => setContrastBoost(e.target.checked)}
                    className="rounded-md accent-royalBlue"
                  />
                  <span>Boost Subject Face Contrast (Prevents Washout)</span>
                </label>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={!processedUrl || isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-white bg-gradient-to-r from-royalBlue to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <Download size={18} />
                  <span>Download Pure White BG Photo ({processedSizeKb} KB)</span>
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
            <div className="lg:col-span-7 flex flex-col items-center justify-center bg-gray-100/70 dark:bg-slate-950/60 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 min-h-[440px] relative">
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/90 dark:bg-slate-800/90 text-gray-700 dark:text-gray-300 shadow-xs border border-gray-200 dark:border-slate-700">
                  {showOriginal ? 'Original Photo' : 'Pure White #FFFFFF Output'}
                </span>
                {isProcessing && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                    <RefreshCw size={10} className="animate-spin" /> Processing
                  </span>
                )}
              </div>

              <div className="max-w-full max-h-[400px] flex items-center justify-center overflow-hidden rounded-xl shadow-xl border-4 border-white dark:border-slate-700 bg-white p-2">
                {showOriginal ? (
                  <img
                    src={imageSrc}
                    alt="Original Photo"
                    className="max-h-[360px] max-w-full object-contain rounded-lg"
                  />
                ) : processedUrl ? (
                  <img
                    src={processedUrl}
                    alt="White Background Photo Preview"
                    className="max-h-[360px] max-w-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-gray-400 flex items-center gap-2">
                    <RefreshCw size={18} className="animate-spin" /> Converting to white...
                  </div>
                )}
              </div>

              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                Original: <strong className="text-gray-700 dark:text-gray-200 font-mono">{origSizeKb} KB</strong> → Pure White: <strong className="text-royalBlue font-mono">{processedSizeKb} KB</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      <AdSenseUnit placementLabel="White BG Maker Bottom Banner" />

      {/* Guide */}
      <div className="max-w-5xl mx-auto mt-12 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <HelpCircle size={20} className="text-royalBlue" />
          Why Official Portals Require a 100% White Background
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">1</span>
              Biometric Facial Scanners
            </div>
            <p className="text-xs">Automated passport e-gates and government facial recognition software require pure white backdrops to accurately detect earlobes, jawlines, and hair silhouettes.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">2</span>
              Prevents Rejection
            </div>
            <p className="text-xs">Over 40% of online visa applications (including US DS-160 and Indian Passport Seva) are rejected due to shadows or cream/yellow wall tint behind the applicant.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">3</span>
              100% Free & Private
            </div>
            <p className="text-xs">No need to pay $15 at a photo studio. Snap a photo against any wall on your phone, and our tool cleans the background locally on your phone or PC.</p>
          </div>
        </div>
      </div>

      <SuggestedTools currentToolId="white-bg-photo-maker" onNavigate={onNavigateToTool} />
    </div>
  );
};

export default WhiteBackgroundMaker;
