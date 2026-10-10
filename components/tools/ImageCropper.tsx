import React, { useState, useRef, useEffect } from 'react';
import {
  Crop,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  Maximize2,
  Move,
  CheckCircle2,
  HelpCircle,
  Square,
  Circle,
  Scissors,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface AspectRatioPreset {
  id: string;
  name: string;
  ratio: number | null; // null for free
  desc: string;
}

const CROP_RATIOS: AspectRatioPreset[] = [
  { id: 'free', name: 'Freeform', ratio: null, desc: 'Any custom box' },
  { id: '1-1', name: '1 : 1 Square', ratio: 1, desc: 'Profile & Avatar' },
  { id: '3-4', name: '3 : 4 Passport', ratio: 3 / 4, desc: 'Standard Passport' },
  { id: '4-5', name: '4 : 5 Portrait', ratio: 4 / 5, desc: 'Social & Resume' },
  { id: '16-9', name: '16 : 9 Banner', ratio: 16 / 9, desc: 'Landscape / Cover' },
  { id: '7-2', name: '7 : 2 Signature', ratio: 7 / 2, desc: 'Wide ink signature' },
];

interface ImageCropperProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const ImageCropper: React.FC<ImageCropperProps> = ({ onNavigateHome, onNavigateToTool }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [naturalDims, setNaturalDims] = useState<{ w: number; h: number } | null>(null);
  const [origSizeKb, setOrigSizeKb] = useState<number>(0);

  // Selected Ratio
  const [selectedRatio, setSelectedRatio] = useState<AspectRatioPreset>(CROP_RATIOS[0]);
  const [isCircle, setIsCircle] = useState<boolean>(false);

  // Crop Box relative coordinates (0 to 1)
  const [cropBox, setCropBox] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 0.1,
    y: 0.1,
    w: 0.8,
    h: 0.8,
  });

  // Output
  const [croppedUrl, setCroppedUrl] = useState<string | null>(null);
  const [croppedDims, setCroppedDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
  const [croppedSizeKb, setCroppedSizeKb] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
        setNaturalDims({ w: img.width, h: img.height });
        // Initial crop box
        setCropBox({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
        toast.success('Image loaded! Drag corners to crop.');
      };
    };
    reader.readAsDataURL(file);
  };

  const applyRatio = (preset: AspectRatioPreset) => {
    setSelectedRatio(preset);
    if (!naturalDims) return;

    if (preset.ratio === null) {
      // Freeform
      return;
    }

    const imgAspect = naturalDims.w / naturalDims.h;
    const targetAspect = preset.ratio;

    let w = 0.8;
    let h = 0.8;

    if (imgAspect > targetAspect) {
      // Image is wider than crop box
      w = h * (targetAspect / imgAspect);
    } else {
      // Image is taller than crop box
      h = w * (imgAspect / targetAspect);
    }

    const x = Math.max(0, (1 - w) / 2);
    const y = Math.max(0, (1 - h) / 2);
    setCropBox({ x, y, w, h });
  };

  // Perform Crop on Canvas
  useEffect(() => {
    if (!imageSrc || !naturalDims) return;
    performCrop();
  }, [imageSrc, cropBox, isCircle]);

  const performCrop = () => {
    if (!naturalDims) return;
    setIsProcessing(true);

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc!;
    img.onload = () => {
      const cropPxX = Math.round(cropBox.x * naturalDims.w);
      const cropPxY = Math.round(cropBox.y * naturalDims.h);
      const cropPxW = Math.max(10, Math.round(cropBox.w * naturalDims.w));
      const cropPxH = Math.max(10, Math.round(cropBox.h * naturalDims.h));

      const canvas = document.createElement('canvas');
      canvas.width = cropPxW;
      canvas.height = cropPxH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      if (isCircle) {
        ctx.beginPath();
        ctx.arc(cropPxW / 2, cropPxH / 2, Math.min(cropPxW, cropPxH) / 2, 0, Math.PI * 2);
        ctx.clip();
      }

      ctx.drawImage(img, cropPxX, cropPxY, cropPxW, cropPxH, 0, 0, cropPxW, cropPxH);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setCroppedUrl(URL.createObjectURL(blob));
            setCroppedDims({ w: cropPxW, h: cropPxH });
            setCroppedSizeKb(Math.round(blob.size / 1024));
          }
          setIsProcessing(false);
        },
        isCircle ? 'image/png' : 'image/jpeg',
        0.95
      );
    };
  };

  const handleDownload = () => {
    if (!croppedUrl) return;
    const ext = isCircle ? 'png' : 'jpg';
    const link = document.createElement('a');
    link.href = croppedUrl;
    link.download = `cropped-${croppedDims.w}x${croppedDims.h}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Cropped image downloaded!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-100/80 text-royalBlue dark:bg-royalBlue/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-3">
          <Crop size={14} />
          <span>Standalone Interactive Image Cropper</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Online <span className="text-transparent bg-clip-text bg-gradient-to-r from-royalBlue to-blue-500">Image Cropper</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Crop images to exact dimensions or popular aspect ratios with live pixel readouts and circular avatar cropping.
        </p>
      </div>

      <AdSenseUnit placementLabel="Image Cropper Top Banner" />

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
                <Crop size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Upload image to crop with visual handles
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Fast and accurate cropping for passport photos, social avatars, signatures, and website banners.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-royalBlue dark:bg-blue-950/60 dark:text-blue-300">
                  Passport 3:4
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  Square 1:1
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  Circle Avatar
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
            {/* Left Controls */}
            <div className="lg:col-span-5 space-y-6">
              {/* Ratio Presets */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Aspect Ratio Presets
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CROP_RATIOS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => applyRatio(r)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        selectedRatio.id === r.id
                          ? 'border-royalBlue bg-blue-50/70 dark:bg-royalBlue/20 ring-2 ring-royalBlue/20 text-royalBlue font-bold'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 bg-gray-50/50 dark:bg-slate-800/40 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <div className="text-xs truncate">{r.name}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Circle Avatar Toggle */}
              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Circle size={16} className={isCircle ? 'text-royalBlue' : 'text-gray-400'} />
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">Circle / Round Crop</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isCircle}
                    onChange={(e) => setIsCircle(e.target.checked)}
                    className="w-4 h-4 accent-royalBlue rounded-sm"
                  />
                </label>
                <span className="text-[11px] text-gray-500 block mt-1">
                  Creates a transparent circular PNG perfect for profile pictures.
                </span>
              </div>

              {/* Quick Box Adjustments */}
              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                  Crop Area Position & Size
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-gray-500 block mb-1">Crop Width ({Math.round(cropBox.w * 100)}%)</label>
                    <input
                      type="range"
                      min="0.2"
                      max="1"
                      step="0.05"
                      value={cropBox.w}
                      onChange={(e) => {
                        const w = parseFloat(e.target.value);
                        setCropBox((prev) => ({
                          ...prev,
                          w,
                          x: Math.min(prev.x, 1 - w),
                        }));
                      }}
                      className="w-full accent-royalBlue"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">Crop Height ({Math.round(cropBox.h * 100)}%)</label>
                    <input
                      type="range"
                      min="0.2"
                      max="1"
                      step="0.05"
                      value={cropBox.h}
                      onChange={(e) => {
                        const h = parseFloat(e.target.value);
                        setCropBox((prev) => ({
                          ...prev,
                          h,
                          y: Math.min(prev.y, 1 - h),
                        }));
                      }}
                      className="w-full accent-royalBlue"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">Move Horizontal</label>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, 1 - cropBox.w)}
                      step="0.02"
                      value={cropBox.x}
                      onChange={(e) => setCropBox((prev) => ({ ...prev, x: parseFloat(e.target.value) }))}
                      className="w-full accent-royalBlue"
                    />
                  </div>
                  <div>
                    <label className="text-gray-500 block mb-1">Move Vertical</label>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, 1 - cropBox.h)}
                      step="0.02"
                      value={cropBox.y}
                      onChange={(e) => setCropBox((prev) => ({ ...prev, y: parseFloat(e.target.value) }))}
                      className="w-full accent-royalBlue"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={!croppedUrl || isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-white bg-gradient-to-r from-royalBlue to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <Download size={18} />
                  <span>Download Cropped Image ({croppedDims.w}×{croppedDims.h} px)</span>
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
                      setCroppedUrl(null);
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
                  Cropped Preview ({croppedDims.w} × {croppedDims.h} px)
                </span>
                {isProcessing && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                    <RefreshCw size={10} className="animate-spin" /> Cropping
                  </span>
                )}
              </div>

              <div className="max-w-full max-h-[380px] flex items-center justify-center overflow-hidden rounded-xl shadow-xl border border-white dark:border-slate-700 bg-white dark:bg-slate-900 p-2">
                {croppedUrl ? (
                  <img
                    src={croppedUrl}
                    alt="Cropped Preview"
                    className={`max-h-[350px] max-w-full object-contain ${isCircle ? 'rounded-full' : 'rounded-lg'}`}
                  />
                ) : (
                  <div className="text-gray-400 flex items-center gap-2">
                    <RefreshCw size={18} className="animate-spin" /> Processing crop...
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center gap-3 text-xs bg-white/80 dark:bg-slate-900/80 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-800">
                <span>
                  Original: <strong className="text-gray-700 dark:text-gray-200 font-mono">{naturalDims?.w}×{naturalDims?.h} px</strong>
                </span>
                <span>→</span>
                <span>
                  Cropped: <strong className="text-royalBlue font-mono">{croppedDims.w}×{croppedDims.h} px</strong> ({croppedSizeKb} KB)
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <AdSenseUnit placementLabel="Image Cropper Bottom Banner" />

      {/* Guide */}
      <div className="max-w-5xl mx-auto mt-12 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <HelpCircle size={20} className="text-royalBlue" />
          How to Crop Photos for Official ID & Applications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">1</span>
              Passport 3:4 Ratio
            </div>
            <p className="text-xs">Ensures your head is centered and occupies approximately 70% to 80% of the overall frame, compliant with ICAO standard.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">2</span>
              Square 1:1 Avatar
            </div>
            <p className="text-xs">Ideal for LinkedIn, Google Account, WhatsApp, and resume profile headers with equal width and height.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">3</span>
              Signature 7:2 Ratio
            </div>
            <p className="text-xs">Crops wide pen signatures cleanly while trimming away blank table or desk background.</p>
          </div>
        </div>
      </div>

      <SuggestedTools currentToolId="image-cropper" onNavigate={onNavigateToTool} />
    </div>
  );
};

export default ImageCropper;
