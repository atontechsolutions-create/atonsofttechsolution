import React, { useState, useEffect, useRef } from 'react';
import {
  RefreshCw,
  Upload,
  Download,
  RotateCw,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Shield,
  FileCheck,
  Sparkles,
} from 'lucide-react';
import {
  readImageMetadata,
  processImage,
  downloadBlob,
  formatBytes,
  ImageMetadata,
  ProcessedImageResult,
} from './imageProcessing';
import AdSenseUnit from './AdSenseUnit';
import SuggestedTools from './SuggestedTools';

interface ImageConverterProps {
  onNavigateHome: (sectionId?: string) => void;
  onNavigateToTool: (path: string) => void;
}

const CONVERTER_FORMATS = [
  { id: 'image/jpeg', name: 'JPG / JPEG', ext: 'jpg', desc: 'Universal, best compatibility' },
  { id: 'image/png', name: 'PNG', ext: 'png', desc: 'Lossless, supports transparency' },
  { id: 'image/webp', name: 'WebP', ext: 'webp', desc: 'Next-gen, lightweight & high quality' },
];

const ImageConverter: React.FC<ImageConverterProps> = ({ onNavigateHome, onNavigateToTool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Conversion Settings
  const [targetFormat, setTargetFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [jpegQuality, setJpegQuality] = useState<number>(92);
  const [pngBackgroundFill, setPngBackgroundFill] = useState<string>('#FFFFFF');

  // Processed state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedResult, setProcessedResult] = useState<ProcessedImageResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // SEO
  useEffect(() => {
    document.title = 'Free Image Converter Online – Convert PNG to JPG, WebP, JPEG';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Convert image formats online for free. Convert PNG to JPG, JPG to WebP, WebP to PNG instantly in your browser with zero data upload.'
      );
    }
  }, []);

  useEffect(() => {
    return () => {
      if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
      if (processedResult?.blobUrl) URL.revokeObjectURL(processedResult.blobUrl);
    };
  }, [rawImageUrl, processedResult]);

  const handleFile = async (selectedFile: File) => {
    setErrorMsg(null);
    if (!selectedFile.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, PNG, WebP, GIF, or BMP).');
      return;
    }
    if (selectedFile.size > 25 * 1024 * 1024) {
      setErrorMsg('File size too large (>25 MB). Please select an image below 25 MB.');
      return;
    }

    try {
      const meta = await readImageMetadata(selectedFile);
      if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
      const url = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setMetadata(meta);
      setRawImageUrl(url);

      // Automatically choose opposite target format (e.g. if PNG, default to JPG; if JPG, default to PNG or WebP)
      if (selectedFile.type === 'image/png') {
        setTargetFormat('image/jpeg');
      } else if (selectedFile.type === 'image/jpeg') {
        setTargetFormat('image/png');
      } else {
        setTargetFormat('image/jpeg');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to read image.');
    }
  };

  // Convert image
  useEffect(() => {
    if (!file || !rawImageUrl || !metadata) return;

    let isMounted = true;
    setIsProcessing(true);

    const timer = setTimeout(async () => {
      try {
        const result = await processImage(file, {
          targetWidth: metadata.width,
          targetHeight: metadata.height,
          maintainAspectRatio: true,
          fitMode: 'contain',
          backgroundColor: targetFormat === 'image/jpeg' ? pngBackgroundFill : 'transparent',
          outputFormat: targetFormat,
          quality: jpegQuality / 100,
        });

        if (isMounted) {
          setProcessedResult(result);
          setIsProcessing(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || 'Conversion failed.');
          setIsProcessing(false);
        }
      }
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [file, rawImageUrl, metadata, targetFormat, jpegQuality, pngBackgroundFill]);

  const handleDownload = () => {
    if (!processedResult) return;
    const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'converted-image';
    const target = CONVERTER_FORMATS.find((f) => f.id === targetFormat);
    const ext = target?.ext || 'jpg';
    const filename = `${baseName}.${ext}`;
    downloadBlob(processedResult.blob, filename);
  };

  const handleReset = () => {
    if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
    if (processedResult?.blobUrl) URL.revokeObjectURL(processedResult.blobUrl);
    setFile(null);
    setRawImageUrl(null);
    setMetadata(null);
    setProcessedResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="bg-gray-50 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-800 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <button onClick={() => onNavigateHome('home')} className="hover:text-vibrantOrange font-medium transition-colors">
              Home
            </button>
            <span>/</span>
            <button onClick={() => onNavigateToTool('/tools')} className="hover:text-vibrantOrange font-medium transition-colors">
              Tools
            </button>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-semibold">Image Converter</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="pt-10 pb-6 sm:pt-14 sm:pb-8 text-center bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-darkBg border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-semibold mb-3 border border-purple-200 dark:border-purple-800/40">
            <RefreshCw size={15} />
            Specific Tool • Convert Formats Between JPG, PNG & WebP
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-gray-900 dark:text-white mb-3">
            Free Online Image Converter
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Quickly convert PNG to JPG, JPG to PNG, or convert images to modern WebP with zero quality loss and instant client-side download.
          </p>
        </div>
      </section>

      {/* Top Ad Unit */}
      <AdSenseUnit placementLabel="Image Converter Top Banner" />

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Upload Box */}
        {!file ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-purple-300 dark:border-purple-700/60 hover:border-purple-500 rounded-3xl p-8 sm:p-14 text-center cursor-pointer bg-purple-50/30 dark:bg-purple-950/10 hover:bg-purple-50/60 dark:hover:bg-purple-950/20 transition-all shadow-sm"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              accept="image/*"
              className="hidden"
            />
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
              <Upload size={32} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              Drag & Drop your image to convert, or browse
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
              Supports PNG, JPG, JPEG, WebP, GIF, and BMP. Fast, high-fidelity conversion.
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs uppercase tracking-wider">
              <Upload size={14} /> Select File
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Conversion Settings */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-md space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 flex items-center justify-center">
                    <RefreshCw size={18} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">Select Target Format</h3>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-gray-500 hover:text-red-500 font-semibold transition-colors flex items-center gap-1"
                >
                  <RotateCw size={12} /> Replace
                </button>
              </div>

              {/* Format Selectors */}
              <div className="space-y-3">
                {CONVERTER_FORMATS.map((fmt) => (
                  <button
                    key={fmt.id}
                    onClick={() => setTargetFormat(fmt.id as any)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${
                      targetFormat === fmt.id
                        ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200'
                        : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm flex items-center gap-2">
                        <span>{fmt.name}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 uppercase">
                          .{fmt.ext}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{fmt.desc}</div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        targetFormat === fmt.id ? 'border-purple-600 bg-purple-600' : 'border-gray-300'
                      }`}
                    >
                      {targetFormat === fmt.id && <span className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                ))}
              </div>

              {/* JPG Quality Slider if JPG or WebP */}
              {(targetFormat === 'image/jpeg' || targetFormat === 'image/webp') && (
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                  <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                    <span>Quality</span>
                    <span className="font-mono text-purple-600">{jpegQuality}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="100"
                    value={jpegQuality}
                    onChange={(e) => setJpegQuality(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>
              )}

              {/* Background Color when converting transparent to JPG */}
              {targetFormat === 'image/jpeg' && (
                <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Background Fill for Transparency
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setPngBackgroundFill('#FFFFFF')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        pngBackgroundFill === '#FFFFFF'
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold'
                          : 'border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      White Fill
                    </button>
                    <button
                      onClick={() => setPngBackgroundFill('#000000')}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                        pngBackgroundFill === '#000000'
                          ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold'
                          : 'border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      Black Fill
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Results Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-md">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                    <FileCheck size={18} className="text-purple-600" /> Conversion Preview
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 uppercase">
                      {metadata?.format.replace('image/', '')}
                    </span>
                    <ArrowRight size={14} className="text-gray-400" />
                    <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 uppercase">
                      {targetFormat.replace('image/', '')}
                    </span>
                  </div>
                </div>

                {/* Preview Box */}
                <div className="h-64 sm:h-72 rounded-2xl bg-gray-100 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 flex items-center justify-center p-3 mb-6 overflow-hidden">
                  {processedResult?.blobUrl ? (
                    <img
                      src={processedResult.blobUrl}
                      alt="Converted preview"
                      className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                    />
                  ) : (
                    <span className="text-xs text-gray-400 animate-pulse">Converting image...</span>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/40">
                    <span className="text-gray-500 block">Original Size:</span>
                    <span className="font-bold font-mono text-gray-900 dark:text-white">
                      {metadata ? formatBytes(metadata.sizeBytes) : '—'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30">
                    <span className="text-purple-700 dark:text-purple-400 block">Converted Size:</span>
                    <span className="font-bold font-mono text-purple-700 dark:text-purple-300">
                      {processedResult ? formatBytes(processedResult.sizeBytes) : 'Converting...'}
                    </span>
                  </div>
                </div>

                {/* Download Button */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleDownload}
                    disabled={!processedResult || isProcessing}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-purple-500/20 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                  >
                    <Download size={18} />
                    Download Converted Image
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* Privacy badge */}
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800 flex items-center gap-3 text-xs text-gray-500">
                <Shield size={18} className="text-purple-600 shrink-0" />
                <span>
                  <strong>Client-Side Processing:</strong> Images are processed directly within your browser. Safe, zero latency, and fully private.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Suggested Tools Section */}
        <SuggestedTools currentToolId="image-converter" onNavigateToTool={onNavigateToTool} />

        {/* Bottom Banner Ad */}
        <div className="mt-12">
          <AdSenseUnit placementLabel="Image Converter Bottom Banner" />
        </div>
      </div>
    </div>
  );
};

export default ImageConverter;
