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
  Sun,
  Contrast,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

const ImageEditorAndRotator: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalSrc, setOriginalSrc] = useState<string | null>(null);
  const [originalSizeKb, setOriginalSizeKb] = useState<number>(0);
  const [originalDims, setOriginalDims] = useState<{ w: number; h: number } | null>(null);

  // Transformations
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270 or arbitrary
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Filters
  const [brightness, setBrightness] = useState<number>(100); // 0 - 200
  const [contrast, setContrast] = useState<number>(100); // 0 - 200
  const [saturation, setSaturation] = useState<number>(100); // 0 - 200
  const [sharpness, setSharpness] = useState<number>(0); // 0 - 100

  // Output
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedDims, setProcessedDims] = useState<{ w: number; h: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image (JPG, PNG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setOriginalSrc(src);
      setSelectedFile(file);
      setOriginalSizeKb(Math.round(file.size / 1024));

      const img = new Image();
      img.src = src;
      img.onload = () => {
        setOriginalDims({ w: img.width, h: img.height });
      };
      resetAdjustments();
      toast.success('Image loaded for editing!');
    };
    reader.readAsDataURL(file);
  };

  const resetAdjustments = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setSharpness(0);
  };

  useEffect(() => {
    if (!originalSrc) return;
    renderAdjustedImage();
  }, [originalSrc, rotation, flipH, flipV, brightness, contrast, saturation]);

  const renderAdjustedImage = () => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = originalSrc!;
    img.onload = () => {
      const isSideways = rotation % 180 !== 0;
      const targetW = isSideways ? img.height : img.width;
      const targetH = isSideways ? img.width : img.height;

      const canvas = document.createElement('canvas');
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Apply CSS Filters (brightness, contrast, saturate)
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

      // Save canvas state
      ctx.save();

      // Move center to center of canvas
      ctx.translate(canvas.width / 2, canvas.height / 2);

      // Rotate
      ctx.rotate((rotation * Math.PI) / 180);

      // Flip
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

      // Draw image centered
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      ctx.restore();

      canvas.toBlob((blob) => {
        if (blob) {
          setProcessedUrl(URL.createObjectURL(blob));
          setProcessedDims({ w: targetW, h: targetH });
          setIsProcessing(false);
        }
      }, selectedFile?.type === 'image/png' ? 'image/png' : 'image/jpeg', 0.95);
    };
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement('a');
    a.href = processedUrl;
    a.download = `adjusted-${selectedFile?.name || 'image.jpg'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Adjusted image downloaded!');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <RotateCw className="w-4 h-4" />
            Rotate • Flip • Brightness & Contrast
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            Image Rotator & Brightness Adjuster
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Rotate clockwise or counter-clockwise (90°, 180°, 270°), flip horizontally/vertically, and calibrate exposure, contrast, and color balance with instant live preview.
          </p>
        </div>

        <AdSenseUnit className="max-w-4xl mx-auto mb-8" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Upload Box */}
            <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" /> 1. Upload Image
              </h2>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                }}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-gray-850/50"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                <RotateCw className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {selectedFile ? selectedFile.name : 'Click to select or drag image here'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Supports JPG, PNG, and WebP up to 25 MB.
                </p>
              </div>
            </div>

            {/* Rotation & Flip Controls */}
            <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <RotateCw className="w-5 h-5 text-emerald-600" /> 2. Orientation & Rotation
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="p-3 rounded-xl border border-gray-200 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2 text-sm font-medium transition-all"
                >
                  <RotateCw className="w-4 h-4 text-emerald-600" /> Rotate 90° CW
                </button>
                <button
                  onClick={() => setRotation((prev) => (prev - 90 + 360) % 360)}
                  className="p-3 rounded-xl border border-gray-200 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-center gap-2 text-sm font-medium transition-all"
                >
                  <RotateCcw className="w-4 h-4 text-emerald-600" /> Rotate 90° CCW
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setFlipH((prev) => !prev)}
                  className={`p-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                    flipH
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700'
                      : 'border-gray-200 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <FlipHorizontal className="w-4 h-4" /> Flip Horizontal
                </button>
                <button
                  onClick={() => setFlipV((prev) => !prev)}
                  className={`p-3 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                    flipV
                      ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700'
                      : 'border-gray-200 dark:border-gray-750 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <FlipVertical className="w-4 h-4" /> Flip Vertical
                </button>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
                <span>Current Rotation: <strong>{rotation}°</strong></span>
                <span>Flipped: <strong>{flipH ? 'H' : ''} {flipV ? 'V' : ''} {!flipH && !flipV ? 'None' : ''}</strong></span>
              </div>
            </div>

            {/* Brightness & Contrast Sliders */}
            <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Sun className="w-5 h-5 text-emerald-600" /> 3. Brightness & Contrast
                </h2>
                <button
                  onClick={resetAdjustments}
                  className="text-xs text-gray-500 hover:text-emerald-600 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset All
                </button>
              </div>

              {/* Brightness */}
              <div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Brightness</span>
                  <span className="font-mono">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="180"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Contrast */}
              <div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Contrast</span>
                  <span className="font-mono">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Saturation */}
              <div>
                <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                  <span>Saturation (Color Boost)</span>
                  <span className="font-mono">{saturation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={saturation}
                  onChange={(e) => setSaturation(Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Preview & Download */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Live Canvas Output
                </h2>
                {processedDims && (
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-mono">
                    {processedDims.w} × {processedDims.h} px
                  </span>
                )}
              </div>

              <div className="min-h-[420px] bg-gray-100 dark:bg-gray-900/60 rounded-xl p-4 flex flex-col items-center justify-center border border-dashed border-gray-300 dark:border-gray-800 overflow-hidden">
                {processedUrl ? (
                  <img
                    src={processedUrl}
                    alt="Processed Preview"
                    className="max-h-[460px] object-contain rounded shadow border border-gray-200 dark:border-gray-700"
                  />
                ) : (
                  <div className="text-center p-8">
                    <RotateCw className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Upload an image to rotate, flip, and calibrate colors in real-time
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  disabled={!processedUrl || isProcessing}
                  onClick={handleDownload}
                  className="flex-1 min-w-[200px] py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-5 h-5" /> Download Adjusted Image
                </button>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setOriginalSrc(null);
                    setProcessedUrl(null);
                  }}
                  disabled={!processedUrl}
                  className="py-3 px-4 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <SuggestedTools currentToolId="image-rotator" />
      </div>
    </div>
  );
};

export default ImageEditorAndRotator;
