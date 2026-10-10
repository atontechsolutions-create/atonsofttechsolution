import React, { useState, useRef, useEffect } from 'react';
import {
  Printer,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  Grid,
  CheckCircle2,
  HelpCircle,
  Sliders,
  Scissors,
  FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface SheetPreset {
  id: string;
  name: string;
  paperName: string;
  photoCount: number;
  rows: number;
  cols: number;
  paperWidthMm: number;
  paperHeightMm: number;
  photoWidthMm: number;
  photoHeightMm: number;
  desc: string;
}

const SHEET_PRESETS: SheetPreset[] = [
  {
    id: '4x6-8photos',
    name: 'Photo to 8 Photos (4×6 inch Postcard)',
    paperName: '4 × 6 inch Photo Paper (10 × 15 cm)',
    photoCount: 8,
    rows: 2,
    cols: 4,
    paperWidthMm: 152.4,
    paperHeightMm: 101.6,
    photoWidthMm: 35,
    photoHeightMm: 45,
    desc: 'Most popular! 8 standard passport photos on cheap 4×6 photo lab print.',
  },
  {
    id: '4x6-6photos',
    name: 'Photo to 6 Photos (4×6 inch)',
    paperName: '4 × 6 inch Photo Paper',
    photoCount: 6,
    rows: 2,
    cols: 3,
    paperWidthMm: 152.4,
    paperHeightMm: 101.6,
    photoWidthMm: 35,
    photoHeightMm: 45,
    desc: '6 passport photos with generous cutting margins.',
  },
  {
    id: '4x6-4photos-2x2',
    name: 'Photo to 4 Photos (2×2 inch US Visa)',
    paperName: '4 × 6 inch Photo Paper',
    photoCount: 4,
    rows: 2,
    cols: 2,
    paperWidthMm: 152.4,
    paperHeightMm: 101.6,
    photoWidthMm: 50.8,
    photoHeightMm: 50.8,
    desc: '4 US Visa / 2×2 inch square photos on standard 4×6 card.',
  },
  {
    id: 'a4-16photos',
    name: 'Photo to 16 Photos (A4 Sheet)',
    paperName: 'A4 Standard Paper (210 × 297 mm)',
    photoCount: 16,
    rows: 4,
    cols: 4,
    paperWidthMm: 210,
    paperHeightMm: 297,
    photoWidthMm: 35,
    photoHeightMm: 45,
    desc: '16 passport photos for family or bulk office applications.',
  },
  {
    id: 'a4-32photos',
    name: 'Photo to 32 Photos (A4 Full Sheet)',
    paperName: 'A4 Standard Paper (210 × 297 mm)',
    photoCount: 32,
    rows: 8,
    cols: 4,
    paperWidthMm: 210,
    paperHeightMm: 297,
    photoWidthMm: 35,
    photoHeightMm: 45,
    desc: 'Maximum capacity 32 passport photos on single A4 sheet.',
  },
];

interface MultiplePassportPhotosPageProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const MultiplePassportPhotosPage: React.FC<MultiplePassportPhotosPageProps> = ({
  onNavigateHome,
  onNavigateToTool,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<SheetPreset>(SHEET_PRESETS[0]);

  // Adjustments
  const [zoom, setZoom] = useState<number>(1);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [showCutLines, setShowCutLines] = useState<boolean>(true);
  const [addBorder, setAddBorder] = useState<boolean>(true);

  // Result
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [sheetSizeKb, setSheetSizeKb] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image (JPG, PNG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSrc(e.target?.result as string);
      setSelectedFile(file);
      setZoom(1);
      setOffsetX(0);
      setOffsetY(0);
      toast.success('Photo loaded! Multiple print sheet ready.');
    };
    reader.readAsDataURL(file);
  };

  // Render sheet
  useEffect(() => {
    if (!imageSrc) return;
    renderMultiplePhotosSheet();
  }, [imageSrc, selectedPreset, zoom, offsetX, offsetY, showCutLines, addBorder]);

  const renderMultiplePhotosSheet = () => {
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc!;
    img.onload = () => {
      const DPI = 300;
      const mmToPx = (mm: number) => Math.round((mm / 25.4) * DPI);

      const paperW = mmToPx(selectedPreset.paperWidthMm);
      const paperH = mmToPx(selectedPreset.paperHeightMm);
      const photoW = mmToPx(selectedPreset.photoWidthMm);
      const photoH = mmToPx(selectedPreset.photoHeightMm);

      // Offscreen single photo
      const single = document.createElement('canvas');
      single.width = photoW;
      single.height = photoH;
      const sCtx = single.getContext('2d');
      if (!sCtx) return;

      sCtx.fillStyle = '#FFFFFF';
      sCtx.fillRect(0, 0, photoW, photoH);

      // Draw user image with zoom & offset
      const scale = Math.max(photoW / img.width, photoH / img.height) * zoom;
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const drawX = (photoW - drawW) / 2 + offsetX;
      const drawY = (photoH - drawH) / 2 + offsetY;

      sCtx.drawImage(img, drawX, drawY, drawW, drawH);

      // Optional border
      if (addBorder) {
        sCtx.strokeStyle = '#D1D5DB';
        sCtx.lineWidth = 2;
        sCtx.strokeRect(1, 1, photoW - 2, photoH - 2);
      }

      // Main sheet canvas
      const sheet = document.createElement('canvas');
      sheet.width = paperW;
      sheet.height = paperH;
      const ctx = sheet.getContext('2d');
      if (!ctx) return;

      // Pure white paper
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, paperW, paperH);

      const { rows, cols } = selectedPreset;
      const totalPhotosW = cols * photoW;
      const totalPhotosH = rows * photoH;

      const spacingX = (paperW - totalPhotosW) / (cols + 1);
      const spacingY = (paperH - totalPhotosH) / (rows + 1);

      // Place photos
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = spacingX + c * (photoW + spacingX);
          const y = spacingY + r * (photoH + spacingY);

          ctx.drawImage(single, x, y, photoW, photoH);

          // Cutting guides / scissors tick marks
          if (showCutLines) {
            ctx.strokeStyle = '#9CA3AF';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);

            // Corner ticks
            ctx.beginPath();
            ctx.moveTo(x - 6, y);
            ctx.lineTo(x + photoW + 6, y);
            ctx.moveTo(x - 6, y + photoH);
            ctx.lineTo(x + photoW + 6, y + photoH);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x, y - 6);
            ctx.lineTo(x, y + photoH + 6);
            ctx.moveTo(x + photoW, y - 6);
            ctx.lineTo(x + photoW, y + photoH + 6);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }
      }

      sheet.toBlob(
        (blob) => {
          if (blob) {
            setSheetUrl(URL.createObjectURL(blob));
            setSheetSizeKb(Math.round(blob.size / 1024));
          }
          setIsProcessing(false);
        },
        'image/jpeg',
        0.95
      );
    };
  };

  const handleDownload = () => {
    if (!sheetUrl) return;
    const link = document.createElement('a');
    link.href = sheetUrl;
    link.download = `multiple-passport-photos-${selectedPreset.photoCount}photos-${selectedPreset.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded sheet with ${selectedPreset.photoCount} passport photos!`);
  };

  const handlePrint = () => {
    if (!sheetUrl) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to open print preview');
      return;
    }
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Passport Photos Sheet</title>
          <style>
            @page { margin: 0; }
            body { margin: 0; display: flex; align-items: center; justify-content: center; }
            img { width: 100vw; height: auto; max-height: 100vh; object-contain; }
          </style>
        </head>
        <body>
          <img src="${sheetUrl}" onload="window.print();window.close();" />
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-3">
          <Grid size={14} />
          <span>Standalone Photo to Multiple Sheet Tool</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Multiple Passport Photos on <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">One Page</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Convert 1 single photo into 8 photos, 6 photos, or 16 photos arranged on 4×6 inch photo paper or A4 sheet with ready-to-cut guidelines.
        </p>
      </div>

      <AdSenseUnit placementLabel="Multiple Passport Photos Top Banner" />

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
              className="border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-3xl p-10 sm:p-16 cursor-pointer transition-all bg-gray-50/60 dark:bg-slate-800/40 hover:bg-emerald-50/40 dark:hover:bg-slate-800/80 group flex flex-col items-center justify-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
                <Grid size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Upload your passport photo to make 8 or 16 copies
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Generate a ready-to-print 300 DPI layout for instant printing at home, pharmacy, or local photo studio.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Photo to 8 Photos (4×6")
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  4×6" Postcard Print
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  A4 Bulk Sheet
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
                  Select Print Layout & Photo Count
                </label>
                <div className="space-y-2">
                  {SHEET_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPreset(p)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all ${
                        selectedPreset.id === p.id
                          ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 bg-gray-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">{p.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-emerald-600 dark:text-emerald-400">
                          {p.photoCount} Photos
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Adjust Photo Framing */}
              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                  Photo Framing & Zoom
                </span>
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
                    className="w-full accent-emerald-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Move Up / Down</label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={offsetY}
                      onChange={(e) => setOffsetY(parseInt(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Move Left / Right</label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={offsetX}
                      onChange={(e) => setOffsetX(parseInt(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>
              </div>

              {/* Print Guidelines & Borders */}
              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                  Guidelines & Border
                </span>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCutLines}
                    onChange={(e) => setShowCutLines(e.target.checked)}
                    className="rounded-md accent-emerald-600"
                  />
                  <span>Show dashed scissor cutting guidelines</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addBorder}
                    onChange={(e) => setAddBorder(e.target.checked)}
                    className="rounded-md accent-emerald-600"
                  />
                  <span>Add clean light border around each photo</span>
                </label>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={!sheetUrl || isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <Download size={18} />
                  <span>Download Print-Ready Sheet ({sheetSizeKb} KB)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrint}
                    disabled={!sheetUrl}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-xs font-semibold text-emerald-700 dark:text-emerald-300 transition-colors"
                  >
                    <Printer size={15} />
                    <span>Print Directly</span>
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
                      setSheetUrl(null);
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
                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/90 dark:bg-slate-800/90 text-gray-700 dark:text-gray-300 shadow-xs border border-gray-200 dark:border-slate-700 flex items-center gap-1">
                  <Scissors size={12} />
                  Print Sheet Preview ({selectedPreset.photoCount} Photos)
                </span>
                {isProcessing && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <RefreshCw size={10} className="animate-spin" /> Rendering
                  </span>
                )}
              </div>

              <div className="max-w-full max-h-[420px] flex items-center justify-center overflow-hidden rounded-xl shadow-2xl border-4 border-white dark:border-slate-700 bg-white p-1">
                {sheetUrl ? (
                  <img
                    src={sheetUrl}
                    alt="Multiple Passport Photos Sheet"
                    className="max-h-[380px] max-w-full object-contain"
                  />
                ) : (
                  <div className="text-gray-400 flex items-center gap-2">
                    <RefreshCw size={18} className="animate-spin" /> Generating sheet...
                  </div>
                )}
              </div>

              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
                Paper: <strong className="text-gray-700 dark:text-gray-200">{selectedPreset.paperName}</strong> • Print at 100% scale (Do not fit to page).
              </div>
            </div>
          </div>
        )}
      </div>

      <AdSenseUnit placementLabel="Multiple Passport Photos Bottom Banner" />

      {/* Guide */}
      <div className="max-w-5xl mx-auto mt-12 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <HelpCircle size={20} className="text-emerald-600" />
          How to Print Multiple Passport Photos on 4×6" Paper for Under $0.20 / ₹10
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">1</span>
              Upload & Choose 8-Photo Grid
            </div>
            <p className="text-xs">Upload your portrait photo. The "Photo to 8 Photos" layout automatically tiles 8 standard 35×45 mm photos onto a standard 4×6 inch postcard.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">2</span>
              Print as Standard 4×6 Photo
            </div>
            <p className="text-xs">Print at home or order a 4×6 inch standard photo print from any local photo lab or pharmacy (Walgreens, CVS, Walmart, or local studio) as an ordinary print.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs">3</span>
              Cut along Guide Marks
            </div>
            <p className="text-xs">Use scissors along the dashed scissor ticks to cut out 8 identical, embassy-compliant official passport photos!</p>
          </div>
        </div>
      </div>

      <SuggestedTools currentToolId="multiple-passport-photos-page" onNavigate={onNavigateToTool} />
    </div>
  );
};

export default MultiplePassportPhotosPage;
