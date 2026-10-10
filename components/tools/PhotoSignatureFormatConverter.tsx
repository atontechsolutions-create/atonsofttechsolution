import React, { useState, useRef, useEffect } from 'react';
import {
  RefreshCw,
  Upload,
  Download,
  Trash2,
  FileCheck,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface PhotoSignatureFormatConverterProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const PhotoSignatureFormatConverter: React.FC<PhotoSignatureFormatConverterProps> = ({
  onNavigateHome,
  onNavigateToTool,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [origFormat, setOrigFormat] = useState<string>('JPG');
  const [origSizeKb, setOrigSizeKb] = useState<number>(0);

  // Target Format
  const [targetFormat, setTargetFormat] = useState<'jpeg' | 'png' | 'webp' | 'pdf'>('jpeg');
  const [targetDpi, setTargetDpi] = useState<number>(300);

  // Output
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [convertedSizeKb, setConvertedSizeKb] = useState<number>(0);
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
      const fmt = file.type.split('/')[1]?.toUpperCase() || 'IMAGE';
      setOrigFormat(fmt);

      // Auto switch target to JPG if PNG uploaded
      if (fmt === 'PNG') setTargetFormat('jpeg');
      else setTargetFormat('png');

      toast.success(`Loaded ${fmt} photo! Ready to convert.`);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!imageSrc) return;
    convertFormat();
  }, [imageSrc, targetFormat, targetDpi]);

  const convertFormat = () => {
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

      // Always fill with white first so converting transparent PNG to JPG does not turn black!
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, img.width, img.height);
      ctx.drawImage(img, 0, 0);

      const mime =
        targetFormat === 'jpeg'
          ? 'image/jpeg'
          : targetFormat === 'png'
          ? 'image/png'
          : 'image/webp';

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setConvertedUrl(URL.createObjectURL(blob));
            setConvertedSizeKb(Math.round(blob.size / 1024));
          }
          setIsProcessing(false);
        },
        mime,
        0.95
      );
    };
  };

  const handleDownload = () => {
    if (!convertedUrl) return;
    const ext = targetFormat === 'jpeg' ? 'jpg' : targetFormat;
    const link = document.createElement('a');
    link.href = convertedUrl;
    link.download = `photo-signature-converted.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded as .${ext.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-100/80 text-royalBlue dark:bg-royalBlue/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-3">
          <RefreshCw size={14} />
          <span>Standalone Photo & Signature Format Converter</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Photo & Signature <span className="text-transparent bg-clip-text bg-gradient-to-r from-royalBlue to-blue-500">Format Converter</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Convert candidate photos and signatures between JPG, PNG, and WebP with white background preservation and no black background glitches.
        </p>
      </div>

      <AdSenseUnit placementLabel="Format Converter Top Banner" />

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
                <RefreshCw size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Upload photo or signature to convert format
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Convert PNG to JPG for SSC / UPSC forms or JPG to PNG for transparent document signatures.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-royalBlue dark:bg-blue-950/60 dark:text-blue-300">
                  PNG to JPG (Govt Portals)
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  White BG Preserved
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200/70 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                  Instant Download
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
            {/* Left Controls */}
            <div className="lg:col-span-5 space-y-6">
              {/* Target Format */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Select Target Output Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTargetFormat('jpeg')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      targetFormat === 'jpeg'
                        ? 'border-royalBlue bg-blue-50/70 dark:bg-royalBlue/20 text-royalBlue font-bold ring-2 ring-royalBlue/20'
                        : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="text-sm">JPG / JPEG</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Govt Portal Standard</div>
                  </button>
                  <button
                    onClick={() => setTargetFormat('png')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      targetFormat === 'png'
                        ? 'border-royalBlue bg-blue-50/70 dark:bg-royalBlue/20 text-royalBlue font-bold ring-2 ring-royalBlue/20'
                        : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="text-sm">PNG</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Lossless Quality</div>
                  </button>
                  <button
                    onClick={() => setTargetFormat('webp')}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      targetFormat === 'webp'
                        ? 'border-royalBlue bg-blue-50/70 dark:bg-royalBlue/20 text-royalBlue font-bold ring-2 ring-royalBlue/20'
                        : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    <div className="text-sm">WebP</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">Compact Web</div>
                  </button>
                </div>
              </div>

              {/* White BG Protection notice */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                <ShieldCheck size={18} className="text-royalBlue shrink-0 mt-0.5" />
                <div>
                  <strong>No Black Background Glitch:</strong> When converting transparent PNG signatures to JPG, our engine automatically layers a clean pure white background so the signature never turns into a black box.
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={!convertedUrl || isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-bold text-white bg-gradient-to-r from-royalBlue to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <Download size={18} />
                  <span>Download as .{targetFormat.toUpperCase()} ({convertedSizeKb} KB)</span>
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
                      setConvertedUrl(null);
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
                  {origFormat} → {targetFormat.toUpperCase()} Preview
                </span>
                {isProcessing && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                    <RefreshCw size={10} className="animate-spin" /> Converting
                  </span>
                )}
              </div>

              <div className="max-w-full max-h-[380px] flex items-center justify-center overflow-hidden rounded-xl shadow-xl border border-white dark:border-slate-700 bg-white dark:bg-slate-900 p-2">
                {convertedUrl ? (
                  <img
                    src={convertedUrl}
                    alt="Converted Preview"
                    className="max-h-[350px] max-w-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-gray-400 flex items-center gap-2">
                    <RefreshCw size={18} className="animate-spin" /> Converting format...
                  </div>
                )}
              </div>

              <div className="mt-5 flex items-center gap-3 text-xs bg-white/80 dark:bg-slate-900/80 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-800">
                <span>
                  Original: <strong className="text-gray-700 dark:text-gray-200 font-mono">{origFormat} ({origSizeKb} KB)</strong>
                </span>
                <span>→</span>
                <span>
                  Output: <strong className="text-royalBlue font-mono">{targetFormat.toUpperCase()} ({convertedSizeKb} KB)</strong>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <AdSenseUnit placementLabel="Format Converter Bottom Banner" />

      {/* Guide */}
      <div className="max-w-5xl mx-auto mt-12 bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-100 dark:border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <HelpCircle size={20} className="text-royalBlue" />
          Why Online Job Forms Require Specific Formats
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600 dark:text-gray-400">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">1</span>
              Strict .JPG Requirement
            </div>
            <p className="text-xs">Most government application portals (SSC, UPSC, State PSC) strictly check file extensions and block .PNG or .WEBP files from being uploaded.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">2</span>
              Fixing Black Background Errors
            </div>
            <p className="text-xs">Converting transparent PNG signatures with standard tools often turns transparent areas into pure black blocks. Our tool guarantees pure white paper fill.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
            <div className="font-bold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-royalBlue flex items-center justify-center text-xs">3</span>
              100% Client-Side Privacy
            </div>
            <p className="text-xs">Conversion runs locally inside your browser canvas. No sensitive personal photos or signature files are uploaded to third-party cloud servers.</p>
          </div>
        </div>
      </div>

      <SuggestedTools currentToolId="photo-signature-format-converter" onNavigate={onNavigateToTool} />
    </div>
  );
};

export default PhotoSignatureFormatConverter;
