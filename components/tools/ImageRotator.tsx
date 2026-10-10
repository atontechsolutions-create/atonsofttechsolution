import React, { useState, useRef, useEffect } from 'react';
import {
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  Sliders,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface ImageRotatorProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const ImageRotator: React.FC<ImageRotatorProps> = ({ onNavigateHome, onNavigateToTool }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [origDims, setOrigDims] = useState<{ w: number; h: number } | null>(null);
  const [origSizeKb, setOrigSizeKb] = useState<number>(0);

  // Rotation and Flip
  const [rotation, setRotation] = useState<number>(0); // In degrees
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Output
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedDims, setProcessedDims] = useState<{ w: number; h: number }>({ w: 0, h: 0 });
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
      setOrigSizeKb(Math.round(file.size / 1024));

      const img = new Image();
      img.src = src;
      img.onload = () => {
        setOrigDims({ w: img.width, h: img.height });
        setRotation(0);
        setFlipH(false);
        setFlipV(false);
        toast.success('Image loaded! Rotate or flip using controls below.');
      };
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!imageSrc) return;
    renderRotatedImage();
  }, [imageSrc, rotation, flipH, flipV]);

  const renderRotatedImage = () => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc!;
    img.onload = () => {
      const rad = (rotation * Math.PI) / 180;
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));

      const newW = Math.round(img.width * cos + img.height * sin);
      const newH = Math.round(img.width * sin + img.height * cos);

      const canvas = document.createElement('canvas');
      canvas.width = newW;
      canvas.height = newH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();
      ctx.translate(newW / 2, newH / 2);
      ctx.rotate(rad);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setProcessedUrl(URL.createObjectURL(blob));
            setProcessedDims({ w: newW, h: newH });
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
    link.download = `rotated-${rotation}deg-${processedDims.w}x${processedDims.h}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Rotated image downloaded!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-100/80 text-royalBlue dark:bg-royalBlue/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-3">
          <RotateCw size={14} />
          <span>Standalone Image Rotator & Flipper</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Online <span className="text-transparent bg-clip-text bg-gradient-to-r from-royalBlue to-blue-500">Image Rotator</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Rotate photos 90° clockwise, 90° counter-clockwise, 180°, or fine-tune angles with mirror horizontal and vertical flip.
        </p>
      </div>

      <AdSenseUnit placementLabel="Image Rotator Top Banner" />

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
                <RotateCw size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Upload image to rotate or flip
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Fix sideways phone photos and upside-down document scans without quality loss.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-royalBlue dark:bg-blue-950/60 dark:text-blue-300">
                  90° Clockwise
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  Flip Horizontal
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  Custom Angle Dial
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
            {/* Left Controls */}
            <div className="lg:col-span-5 space-y-6">
              {/* Quick Rotation Buttons */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Quick 90° Turn
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-royalBlue bg-gray-50 dark:bg-slate-800 text-xs font-semibold gap-1.5 transition-all"
                  >
                    <RotateCcw size={18} className="text-royalBlue" />
                    <span>-90° Left</span>
                  </button>
                  <button
                    onClick={() => setRotation((prev) => (prev + 90) % 360)}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-royalBlue bg-gray-50 dark:bg-slate-800 text-xs font-semibold gap-1.5 transition-all"
                  >
                    <RotateCw size={18} className="text-royalBlue" />
                    <span>+90° Right</span>
                  </button>
                  <button
                    onClick={() => setRotation((prev) => (prev + 180) % 360)}
                    className="flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-200 dark:border-slate-700 hover:border-royalBlue bg-gray-50 dark:bg-slate-800 text-xs font-semibold gap-1.5 transition-all"
                  >
                    <RefreshCw size={18} className="text-royalBlue" />
                    <span>180° Flip</span>
                  </button>
                </div>
              </div>

              {/* Mirror Flips */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Mirror Flip
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFlipH(!flipH)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all text-xs font-bold ${
                      flipH
                        ? 'border-royalBlue bg-blue-50/70 dark:bg-royalBlue/20 text-royalBlue'
                        : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <FlipHorizontal size={18} />
                    <span>Flip Horizontal</span>
                  </button>
                  <button
                    onClick={() => setFlipV(!flipV)}
                    className={`flex items-center justify-center gap-2 p-3 rounded-2xl border transition-all text-xs font-bold ${
                      flipV
                        ? 'border-royalBlue bg-blue-50/70 dark:bg-royalBlue/20 text-royalBlue'
                        : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <FlipVertical size={18} />
                    <span>Flip Vertical</span>
                  </button>
                </div>
              </div>

              {/* Fine Tune Slider */}
              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-gray-800 dark:text-gray-200">Arbitrary Angle Dial</span>
                  <span className="font-mono font-bold text-royalBlue">{rotation}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value))}
                  className="w-full accent-royalBlue"
                />
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>-180°</span>
                  <button onClick={() => setRotation(0)} className="text-royalBlue hover:underline">
                    Reset 0°
                  </button>
                  <span>+180°</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={!processedUrl || isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-white bg-gradient-to-r from-royalBlue to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <Download size={18} />
                  <span>Download Rotated Image</span>
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
                  Orientation: {rotation}° {flipH ? '| Flip H' : ''} {flipV ? '| Flip V' : ''}
                </span>
                {isProcessing && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                    <RefreshCw size={10} className="animate-spin" /> Rotating
                  </span>
                )}
              </div>

              <div className="max-w-full max-h-[380px] flex items-center justify-center overflow-hidden rounded-xl shadow-xl border border-white dark:border-slate-700 bg-white dark:bg-slate-900 p-2">
                {processedUrl ? (
                  <img
                    src={processedUrl}
                    alt="Rotated Preview"
                    className="max-h-[350px] max-w-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-gray-400 flex items-center gap-2">
                    <RefreshCw size={18} className="animate-spin" /> Processing rotation...
                  </div>
                )}
              </div>

              <div className="mt-5 text-xs text-gray-500 dark:text-gray-400 text-center">
                Dimensions: <strong className="text-royalBlue font-mono">{processedDims.w} × {processedDims.h} px</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      <AdSenseUnit placementLabel="Image Rotator Bottom Banner" />

      {/* Guide */}
      <div className="max-w-5xl mx-auto mt-12 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <HelpCircle size={20} className="text-royalBlue" />
          Common Uses for Image Rotation & Flipping
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">1</span>
              Smartphone EXIF Correction
            </div>
            <p className="text-xs">Many smartphone cameras save orientation metadata that displays sideways when uploaded to websites. Rotating fixes the raw pixel grid permanently.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">2</span>
              Document & Certificate Scans
            </div>
            <p className="text-xs">Scanned marks sheets, Aadhaar cards, and diplomas often feed upside-down into flatbed scanners. A single 180° rotation rights them instantly.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">3</span>
              Mirror Selfies
            </div>
            <p className="text-xs">Flip horizontally to correct inverted selfie camera photos so text on shirts and natural facial orientation look normal.</p>
          </div>
        </div>
      </div>

      <SuggestedTools currentToolId="image-rotator" onNavigate={onNavigateToTool} />
    </div>
  );
};

export default ImageRotator;
