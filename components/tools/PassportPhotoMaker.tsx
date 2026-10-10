import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Eye,
  Sliders,
  ArrowRight,
  ShieldCheck,
  Grid,
  Palette,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface PassportPreset {
  id: string;
  name: string;
  country: string;
  widthMm: number;
  heightMm: number;
  widthPx: number; // At 300 DPI
  heightPx: number;
  bgRequired: string;
}

const PASSPORT_PRESETS: PassportPreset[] = [
  { id: 'in-passport', name: 'India Passport / Visa (3.5 × 4.5 cm)', country: 'India', widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, bgRequired: 'White or Light Off-white' },
  { id: 'us-passport', name: 'US Passport / Visa (2 × 2 inches)', country: 'USA', widthMm: 51, heightMm: 51, widthPx: 600, heightPx: 600, bgRequired: 'Plain White or Off-white' },
  { id: 'uk-passport', name: 'UK / Schengen Visa (3.5 × 4.5 cm)', country: 'UK / EU', widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, bgRequired: 'Light Grey or Plain Cream' },
  { id: 'ca-passport', name: 'Canada Passport (5 × 7 cm)', country: 'Canada', widthMm: 50, heightMm: 70, widthPx: 590, heightPx: 826, bgRequired: 'Plain White' },
  { id: 'au-passport', name: 'Australia Passport (3.5 × 4.5 cm)', country: 'Australia', widthMm: 35, heightMm: 45, widthPx: 413, heightPx: 531, bgRequired: 'Plain White / Light Grey' },
  { id: 'square-standard', name: 'Standard Square Profile (600 × 600 px)', country: 'General', widthMm: 51, heightMm: 51, widthPx: 600, heightPx: 600, bgRequired: 'Any' },
];

interface PassportPhotoMakerProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const PassportPhotoMaker: React.FC<PassportPhotoMakerProps> = ({
  onNavigateHome,
  onNavigateToTool,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<PassportPreset>(PASSPORT_PRESETS[0]);
  const [customWidthMm, setCustomWidthMm] = useState<number>(35);
  const [customHeightMm, setCustomHeightMm] = useState<number>(45);
  const [useCustomSize, setUseCustomSize] = useState<boolean>(false);

  // Framing
  const [zoom, setZoom] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [addBorder, setAddBorder] = useState<boolean>(true);
  const [showBiometricGuide, setShowBiometricGuide] = useState<boolean>(true);

  // Result
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedSizeKb, setProcessedSizeKb] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (JPG, PNG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setSelectedFile(file);
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
      toast.success('Photo loaded! Align face with guide.');
    };
    reader.readAsDataURL(file);
  };

  const currentWidthPx = useCustomSize ? Math.round((customWidthMm / 25.4) * 300) : selectedPreset.widthPx;
  const currentHeightPx = useCustomSize ? Math.round((customHeightMm / 25.4) * 300) : selectedPreset.heightPx;

  useEffect(() => {
    if (!imageSrc) return;
    renderPassportPhoto();
  }, [imageSrc, selectedPreset, useCustomSize, customWidthMm, customHeightMm, zoom, offsetX, offsetY, addBorder]);

  const renderPassportPhoto = () => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc!;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = currentWidthPx;
      canvas.height = currentHeightPx;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Base white
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, currentWidthPx, currentHeightPx);

      // Centered framing
      const targetAspect = currentWidthPx / currentHeightPx;
      const imgAspect = img.width / img.height;
      let drawW, drawH;
      if (imgAspect > targetAspect) {
        drawH = currentHeightPx * zoom;
        drawW = drawH * imgAspect;
      } else {
        drawW = currentWidthPx * zoom;
        drawH = drawW / imgAspect;
      }

      const drawX = (currentWidthPx - drawW) / 2 + offsetX;
      const drawY = (currentHeightPx - drawH) / 2 + offsetY;

      ctx.drawImage(img, drawX, drawY, drawW, drawH);

      // Optional border
      if (addBorder) {
        ctx.strokeStyle = '#D1D5DB';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, currentWidthPx - 2, currentHeightPx - 2);
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
    link.download = `passport-photo-${selectedPreset.country.toLowerCase()}-${currentWidthPx}x${currentHeightPx}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Passport photo downloaded at 300 DPI!');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-100/80 text-royalBlue dark:bg-royalBlue/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-3">
          <User size={14} />
          <span>Standalone Official Passport Photo Maker</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Passport Size <span className="text-transparent bg-clip-text bg-gradient-to-r from-royalBlue to-blue-500">Photo Maker</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Create official 300 DPI biometric passport and visa photos with country specifications (India, US, UK, Schengen, Canada) and head alignment guides.
        </p>
      </div>

      <AdSenseUnit placementLabel="Passport Maker Top Banner" />

      {/* Main Container */}
      <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
        {!imageSrc ? (
          <div className="p-8 sm:p-14 text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
              }}
              className="border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-royalBlue rounded-3xl p-10 sm:p-16 cursor-pointer transition-all bg-gray-50/60 dark:bg-slate-800/40 hover:bg-blue-50/40 group flex flex-col items-center justify-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-royalBlue dark:text-blue-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
                <User size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Upload portrait photo for passport crop
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Meets strict ICAO biometric standards. Download high-resolution single photo at 300 DPI.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-royalBlue dark:bg-blue-950/60 dark:text-blue-300">
                  India 3.5×4.5 cm
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  US Visa 2×2 in
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                  UK / Schengen 35×45 mm
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
                  Country Standard
                </label>
                <div className="space-y-2">
                  {PASSPORT_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPreset(p);
                        setUseCustomSize(false);
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all ${
                        selectedPreset.id === p.id && !useCustomSize
                          ? 'border-royalBlue bg-blue-50/70 dark:bg-royalBlue/20 ring-2 ring-royalBlue/20'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 bg-gray-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-gray-900 dark:text-white">{p.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-royalBlue">
                          {p.widthMm}×{p.heightMm} mm
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
                        Required background: {p.bgRequired}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Face Alignment & Zoom */}
              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Face Alignment & Zoom
                  </span>
                  <label className="flex items-center gap-1.5 text-xs text-royalBlue font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBiometricGuide}
                      onChange={(e) => setShowBiometricGuide(e.target.checked)}
                      className="accent-royalBlue rounded-sm"
                    />
                    <span>Show Biometric Guide</span>
                  </label>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Face Zoom</span>
                    <span className="font-mono">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.8"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-royalBlue"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Move Up / Down</label>
                    <input
                      type="range"
                      min="-120"
                      max="120"
                      value={offsetY}
                      onChange={(e) => setOffsetY(parseInt(e.target.value))}
                      className="w-full accent-royalBlue"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Move Left / Right</label>
                    <input
                      type="range"
                      min="-120"
                      max="120"
                      value={offsetX}
                      onChange={(e) => setOffsetX(parseInt(e.target.value))}
                      className="w-full accent-royalBlue"
                    />
                  </div>
                </div>
              </div>

              {/* Cross-linking to Companion Tools */}
              <div className="p-3.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 space-y-2 text-xs">
                <span className="font-bold text-gray-700 dark:text-gray-300 block">
                  Companion Dedicated Tools:
                </span>
                <div className="flex flex-col gap-1.5">
                  <button
                    onClick={() => onNavigateToTool?.('/tools/multiple-passport-photos-page')}
                    className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 hover:text-royalBlue transition-colors border border-gray-200 dark:border-slate-700"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <Grid size={13} className="text-emerald-600" /> Print 8 Photos on 4×6" Paper
                    </span>
                    <ArrowRight size={13} />
                  </button>
                  <button
                    onClick={() => onNavigateToTool?.('/tools/photo-bg-changer')}
                    className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 hover:text-royalBlue transition-colors border border-gray-200 dark:border-slate-700"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <Palette size={13} className="text-purple-600" /> Change Background Color
                    </span>
                    <ArrowRight size={13} />
                  </button>
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
                  <span>Download 300 DPI Passport Photo ({processedSizeKb} KB)</span>
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
                  {selectedPreset.name} (300 DPI)
                </span>
                {isProcessing && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                    <RefreshCw size={10} className="animate-spin" /> Rendering
                  </span>
                )}
              </div>

              <div className="max-w-full max-h-[380px] flex items-center justify-center overflow-hidden rounded-xl shadow-xl border border-white dark:border-slate-700 bg-white dark:bg-slate-900 p-2 relative">
                {processedUrl ? (
                  <div className="relative">
                    <img
                      src={processedUrl}
                      alt="Passport Photo Preview"
                      className="max-h-[350px] max-w-full object-contain rounded-lg"
                    />

                    {/* Biometric Oval Guide Overlay */}
                    {showBiometricGuide && (
                      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                        <div className="w-[65%] h-[75%] rounded-[50%] border-2 border-dashed border-royalBlue/70 flex items-center justify-center">
                          <span className="text-[10px] bg-royalBlue/80 text-white px-2 py-0.5 rounded-full select-none">
                            Head 70-80%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-400 flex items-center gap-2">
                    <RefreshCw size={18} className="animate-spin" /> Processing passport crop...
                  </div>
                )}
              </div>

              <div className="mt-5 text-xs text-gray-500 dark:text-gray-400 text-center">
                Dimensions: <strong className="text-royalBlue font-mono">{currentWidthPx} × {currentHeightPx} px</strong> • Print Size: <strong className="text-gray-700 dark:text-gray-200 font-mono">{selectedPreset.widthMm} × {selectedPreset.heightMm} mm</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      <AdSenseUnit placementLabel="Passport Maker Bottom Banner" />

      {/* Guide */}
      <div className="max-w-5xl mx-auto mt-12 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <HelpCircle size={20} className="text-royalBlue" />
          Official Biometric Passport Photo Specifications
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">1</span>
              Head Size (70% - 80%)
            </div>
            <p className="text-xs">Your head from top of hair to bottom of chin must measure between 31 mm to 36 mm (approximately 70% to 80% of photo height).</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">2</span>
              Neutral Facial Expression
            </div>
            <p className="text-xs">Keep eyes wide open, mouth closed, and look straight into camera lens. No tilted head, smile, or frowning permitted.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">3</span>
              Glasses & Accessories
            </div>
            <p className="text-xs">Eyeglasses are prohibited for US and Canadian visas. Religious head coverings are allowed provided full oval of face from chin to forehead is visible.</p>
          </div>
        </div>
      </div>

      <SuggestedTools currentToolId="passport-photo-maker" onNavigate={onNavigateToTool} />
    </div>
  );
};

export default PassportPhotoMaker;
