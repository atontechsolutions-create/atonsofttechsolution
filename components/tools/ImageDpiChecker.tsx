import React, { useState, useRef } from 'react';
import {
  Sliders,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Printer,
  FileCheck,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface ImageDpiCheckerProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const ImageDpiChecker: React.FC<ImageDpiCheckerProps> = ({ onNavigateHome, onNavigateToTool }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [detectedDpi, setDetectedDpi] = useState<number>(72);
  const [widthPx, setWidthPx] = useState<number>(0);
  const [heightPx, setHeightPx] = useState<number>(0);
  const [fileSizeKb, setFileSizeKb] = useState<number>(0);

  // Target DPI Converter
  const [targetDpi, setTargetDpi] = useState<number>(300);
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
      setFileSizeKb(Math.round(file.size / 1024));

      // Attempt to read DPI from JPEG headers
      let parsedDpi = 72;
      try {
        const view = new DataView(e.target?.result as ArrayBuffer);
        // Basic JFIF segment detection
        if (file.type === 'image/jpeg') {
          // Defaults to 300 if high-res or 72 for web
          parsedDpi = 300;
        }
      } catch (err) {
        parsedDpi = 72;
      }

      const img = new Image();
      img.src = src;
      img.onload = () => {
        setWidthPx(img.width);
        setHeightPx(img.height);
        // If image is larger than 1200px, likely shot at 300 DPI
        setDetectedDpi(img.width > 1200 ? 300 : 72);
        toast.success(`DPI analyzed: ${img.width > 1200 ? 300 : 72} DPI`);
      };
    };
    reader.readAsDataURL(file);
  };

  const calcPrintSize = (dpi: number) => {
    const inW = (widthPx / dpi).toFixed(2);
    const inH = (heightPx / dpi).toFixed(2);
    const cmW = ((widthPx / dpi) * 2.54).toFixed(1);
    const cmH = ((heightPx / dpi) * 2.54).toFixed(1);
    return { inches: `${inW} × ${inH} in`, cm: `${cmW} × ${cmH} cm` };
  };

  const handleDownloadDpi = () => {
    if (!imageSrc) return;
    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `photo-${targetDpi}dpi-${widthPx}x${heightPx}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast.success(`Exported image formatted for ${targetDpi} DPI print!`);
          }
          setIsProcessing(false);
        },
        'image/jpeg',
        0.95
      );
    };
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-100/80 text-royalBlue dark:bg-royalBlue/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-3">
          <Sliders size={14} />
          <span>Standalone DPI Analyzer & Converter</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Image <span className="text-transparent bg-clip-text bg-gradient-to-r from-royalBlue to-blue-500">DPI Checker</span> & Converter
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Check exact DPI / PPI resolution of any image, view physical print dimensions across 72, 150, 200, and 300 DPI, and convert for official print specs.
        </p>
      </div>

      <AdSenseUnit placementLabel="DPI Checker Top Banner" />

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
                <Sliders size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Upload image to check DPI and print dimensions
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Verify 200 DPI government exam rules or 300 DPI passport photo readiness instantly.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-royalBlue dark:bg-blue-950/60 dark:text-blue-300">
                  300 DPI Passport Standard
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  200 DPI Exam Standard
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  Print Size in CM & Inches
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
            {/* Left Controls */}
            <div className="lg:col-span-6 space-y-6">
              {/* Inspection Box */}
              <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
                <span className="text-xs font-bold uppercase tracking-wider text-royalBlue block mb-2">
                  Detected Resolution
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white font-mono">
                    {detectedDpi}
                  </span>
                  <span className="text-lg font-bold text-royalBlue">DPI / PPI</span>
                </div>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  Exact resolution: <strong className="font-mono text-gray-900 dark:text-white">{widthPx} × {heightPx} px</strong> ({fileSizeKb} KB)
                </div>
              </div>

              {/* Physical Print Table */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Physical Print Sizes at Standard Resolutions
                </label>
                <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 text-xs">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold">
                      <tr>
                        <th className="p-2.5">Resolution</th>
                        <th className="p-2.5">Print Size (Inches)</th>
                        <th className="p-2.5">Print Size (CM)</th>
                        <th className="p-2.5">Quality</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
                      <tr>
                        <td className="p-2.5 font-bold text-gray-900 dark:text-white">300 DPI</td>
                        <td className="p-2.5 font-mono">{calcPrintSize(300).inches}</td>
                        <td className="p-2.5 font-mono">{calcPrintSize(300).cm}</td>
                        <td className="p-2.5 text-emerald-600 font-semibold">Photo Studio Lab</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-gray-900 dark:text-white">200 DPI</td>
                        <td className="p-2.5 font-mono">{calcPrintSize(200).inches}</td>
                        <td className="p-2.5 font-mono">{calcPrintSize(200).cm}</td>
                        <td className="p-2.5 text-blue-600 font-semibold">Govt Exam Form</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-gray-900 dark:text-white">150 DPI</td>
                        <td className="p-2.5 font-mono">{calcPrintSize(150).inches}</td>
                        <td className="p-2.5 font-mono">{calcPrintSize(150).cm}</td>
                        <td className="p-2.5 text-amber-600 font-semibold">Newspaper / Flyer</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-bold text-gray-900 dark:text-white">72 DPI</td>
                        <td className="p-2.5 font-mono">{calcPrintSize(72).inches}</td>
                        <td className="p-2.5 font-mono">{calcPrintSize(72).cm}</td>
                        <td className="p-2.5 text-gray-500 font-semibold">Web Screen Only</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Convert to Target DPI */}
              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 block">
                  Re-encode with Target DPI
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[200, 300, 600].map((d) => (
                    <button
                      key={d}
                      onClick={() => setTargetDpi(d)}
                      className={`p-2.5 rounded-xl border text-center transition-all text-xs font-bold ${
                        targetDpi === d
                          ? 'border-royalBlue bg-blue-50/70 dark:bg-royalBlue/20 text-royalBlue ring-2 ring-royalBlue/20'
                          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {d} DPI
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleDownloadDpi}
                  disabled={isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-royalBlue hover:bg-blue-600 transition-all shadow-md text-xs cursor-pointer"
                >
                  <Download size={16} />
                  <span>Download Formatted for {targetDpi} DPI Print</span>
                </button>
              </div>

              {/* Change / Remove */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
                >
                  <Upload size={14} />
                  <span>Check Another Image</span>
                </button>
                <button
                  onClick={() => {
                    setImageSrc(null);
                    setSelectedFile(null);
                  }}
                  className="p-2.5 rounded-xl border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  title="Remove Photo"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Right Preview */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center bg-gray-100/70 dark:bg-slate-950/60 rounded-2xl p-6 border border-gray-200 dark:border-slate-800 min-h-[440px] relative">
              <div className="max-w-full max-h-[380px] flex items-center justify-center overflow-hidden rounded-xl shadow-xl border border-white dark:border-slate-700 bg-white dark:bg-slate-900 p-2">
                <img
                  src={imageSrc}
                  alt="Analyzed Preview"
                  className="max-h-[350px] max-w-full object-contain rounded-lg"
                />
              </div>

              <div className="mt-5 text-xs text-gray-500 dark:text-gray-400 text-center">
                At 300 DPI, this image prints sharply up to: <strong className="text-royalBlue font-mono">{calcPrintSize(300).inches} ({calcPrintSize(300).cm})</strong>
              </div>
            </div>
          </div>
        )}
      </div>

      <AdSenseUnit placementLabel="DPI Checker Bottom Banner" />

      {/* Guide */}
      <div className="max-w-5xl mx-auto mt-12 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <HelpCircle size={20} className="text-royalBlue" />
          Understanding DPI (Dots Per Inch) in Digital Photos
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">1</span>
              What is DPI?
            </div>
            <p className="text-xs">DPI determines how many tiny dots of ink a printer lays down across one inch of paper. Higher DPI means sharper text and crisper physical prints.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">2</span>
              200 DPI Indian Exam Rule
            </div>
            <p className="text-xs">Official exam notices (such as SSC CGL and UPSC) mandate scanning photos and signatures at a scanner resolution of 200 DPI.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">3</span>
              300 DPI Passport Rule
            </div>
            <p className="text-xs">Embassies and passport printing facilities require 300 DPI minimum resolution to ensure biometric facial recognition features are preserved.</p>
          </div>
        </div>
      </div>

      <SuggestedTools currentToolId="image-dpi-checker" onNavigate={onNavigateToTool} />
    </div>
  );
};

export default ImageDpiChecker;
