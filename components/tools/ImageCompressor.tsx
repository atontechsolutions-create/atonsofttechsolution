import React, { useState, useEffect, useRef } from 'react';
import {
  Minimize2,
  Upload,
  Download,
  RotateCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Shield,
  FileCheck,
  TrendingDown,
  Sparkles,
  ArrowRight,
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

interface ImageCompressorProps {
  onNavigateHome: (sectionId?: string) => void;
  onNavigateToTool: (path: string) => void;
}

const COMMON_KB_PRESETS = [10, 20, 50, 100, 200, 500];

const ImageCompressor: React.FC<ImageCompressorProps> = ({ onNavigateHome, onNavigateToTool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compression Controls
  const [mode, setMode] = useState<'targetKb' | 'qualitySlider'>('targetKb');
  const [targetKb, setTargetKb] = useState<number>(50);
  const [customKb, setCustomKb] = useState<string>('50');
  const [qualitySlider, setQualitySlider] = useState<number>(75);
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/webp' | 'image/png'>('image/jpeg');
  const [maxDimensionCap, setMaxDimensionCap] = useState<number>(1920);

  // Processed state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedResult, setProcessedResult] = useState<ProcessedImageResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // SEO
  useEffect(() => {
    document.title = 'Free Image Compressor Online – Compress JPG & PNG to 20KB, 50KB, 100KB';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Compress JPG, PNG, and WebP images to exact target file sizes in KB. 100% free, private client-side processing without uploading files to a server.'
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
      setErrorMsg('Please select a valid image (JPG, JPEG, PNG, or WebP).');
      return;
    }
    if (selectedFile.size > 30 * 1024 * 1024) {
      setErrorMsg('File too large (>30 MB). Please pick an image below 30 MB.');
      return;
    }

    try {
      const meta = await readImageMetadata(selectedFile);
      if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
      const url = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setMetadata(meta);
      setRawImageUrl(url);

      // Default target KB to something smaller than source
      const srcKb = Math.round(meta.sizeBytes / 1024);
      if (srcKb > 100) {
        setTargetKb(50);
        setCustomKb('50');
      } else if (srcKb > 30) {
        setTargetKb(20);
        setCustomKb('20');
      } else {
        setTargetKb(10);
        setCustomKb('10');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to read image file.');
    }
  };

  // Perform compression
  useEffect(() => {
    if (!file || !rawImageUrl || !metadata) return;

    let isMounted = true;
    setIsProcessing(true);

    const timer = setTimeout(async () => {
      try {
        let targetWidth = metadata.width;
        let targetHeight = metadata.height;

        // If image is huge, cap dimensions proportionally for mobile speed
        if (targetWidth > maxDimensionCap || targetHeight > maxDimensionCap) {
          const ratio = metadata.width / metadata.height;
          if (targetWidth > targetHeight) {
            targetWidth = maxDimensionCap;
            targetHeight = Math.round(maxDimensionCap / ratio);
          } else {
            targetHeight = maxDimensionCap;
            targetWidth = Math.round(maxDimensionCap * ratio);
          }
        }

        const result = await processImage(file, {
          targetWidth,
          targetHeight,
          maintainAspectRatio: true,
          fitMode: 'contain',
          backgroundColor: outputFormat === 'image/jpeg' ? '#FFFFFF' : 'transparent',
          targetKb: mode === 'targetKb' ? targetKb : undefined,
          quality: mode === 'qualitySlider' ? qualitySlider / 100 : undefined,
          outputFormat,
        });

        if (isMounted) {
          setProcessedResult(result);
          setIsProcessing(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || 'Compression failed.');
          setIsProcessing(false);
        }
      }
    }, 180);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [file, rawImageUrl, metadata, mode, targetKb, qualitySlider, outputFormat, maxDimensionCap]);

  const handleDownload = () => {
    if (!processedResult) return;
    const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'image';
    const ext =
      processedResult.format === 'image/jpeg'
        ? 'jpg'
        : processedResult.format === 'image/webp'
        ? 'webp'
        : 'png';
    const finalKb = Math.round(processedResult.sizeBytes / 1024);
    const filename = `compressed-${baseName}-${finalKb}kb.${ext}`;
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
    setMode('targetKb');
    setTargetKb(50);
    setCustomKb('50');
    setQualitySlider(75);
    setOutputFormat('image/jpeg');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Savings calculation
  const savingsPercent =
    metadata && processedResult && metadata.sizeBytes > processedResult.sizeBytes
      ? Math.round(((metadata.sizeBytes - processedResult.sizeBytes) / metadata.sizeBytes) * 100)
      : 0;

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
            <span className="text-gray-900 dark:text-white font-semibold">Image Compressor</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="pt-10 pb-6 sm:pt-14 sm:pb-8 text-center bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-darkBg border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-royalBlue/20 text-royalBlue dark:text-blue-300 text-xs sm:text-sm font-semibold mb-3 border border-blue-200 dark:border-blue-800">
            <Minimize2 size={15} />
            Specific Tool • Compress to Exact KB with Zero Distortion
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-gray-900 dark:text-white mb-3">
            Free Online Image Compressor
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Compress JPG, PNG, and WebP images to your required file size limit (10 KB, 20 KB, 50 KB, 100 KB) instantly on your device without losing visual clarity.
          </p>
        </div>
      </section>

      {/* Top Ad Unit */}
      <AdSenseUnit placementLabel="Image Compressor Top Banner" />

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
            className="border-2 border-dashed border-blue-300 dark:border-blue-700/60 hover:border-royalBlue rounded-3xl p-8 sm:p-14 text-center cursor-pointer bg-blue-50/30 dark:bg-blue-950/10 hover:bg-blue-50/60 dark:hover:bg-blue-950/20 transition-all shadow-sm"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-blue-100 dark:bg-blue-900/40 text-royalBlue dark:text-blue-400 flex items-center justify-center mb-4">
              <Upload size={32} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              Drag & Drop your image to compress, or browse
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
              Supports JPEG, JPG, PNG, and WebP files. Instant in-browser compression.
            </p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-royalBlue text-white font-bold text-xs uppercase tracking-wider">
              <Upload size={14} /> Choose Image
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Compression Settings */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-md space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-royalBlue flex items-center justify-center">
                    <Sliders size={18} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">Compression Settings</h3>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-gray-500 hover:text-red-500 font-semibold transition-colors flex items-center gap-1"
                >
                  <RotateCw size={12} /> Replace
                </button>
              </div>

              {/* Mode switch: Target KB vs Quality Slider */}
              <div className="grid grid-cols-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl">
                <button
                  onClick={() => setMode('targetKb')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    mode === 'targetKb'
                      ? 'bg-white dark:bg-slate-900 text-royalBlue dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Target KB Size
                </button>
                <button
                  onClick={() => setMode('qualitySlider')}
                  className={`py-2 text-xs font-bold rounded-xl transition-all ${
                    mode === 'qualitySlider'
                      ? 'bg-white dark:bg-slate-900 text-royalBlue dark:text-blue-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Quality Slider
                </button>
              </div>

              {/* Target KB Presets */}
              {mode === 'targetKb' ? (
                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Target File Size (KB)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {COMMON_KB_PRESETS.map((kb) => (
                      <button
                        key={kb}
                        onClick={() => {
                          setTargetKb(kb);
                          setCustomKb(kb.toString());
                        }}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                          targetKb === kb
                            ? 'bg-royalBlue text-white border-royalBlue'
                            : 'border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                        }`}
                      >
                        {kb} KB
                      </button>
                    ))}
                  </div>

                  <div>
                    <span className="text-[11px] text-gray-500 block mb-1">Or Enter Custom KB:</span>
                    <input
                      type="number"
                      value={customKb}
                      onChange={(e) => {
                        setCustomKb(e.target.value);
                        const num = Number(e.target.value);
                        if (num > 0) setTargetKb(num);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/60 font-mono text-sm text-gray-900 dark:text-white"
                      min={5}
                      max={5000}
                      placeholder="e.g. 35"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400">
                    <span>Quality Level</span>
                    <span className="font-mono text-royalBlue">{qualitySlider}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={qualitySlider}
                    onChange={(e) => setQualitySlider(Number(e.target.value))}
                    className="w-full accent-royalBlue cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>Smaller file</span>
                    <span>Higher quality</span>
                  </div>
                </div>
              )}

              {/* Output Format */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Output Format
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'JPG / JPEG', value: 'image/jpeg', tip: 'Best for KB target' },
                    { label: 'WebP', value: 'image/webp', tip: 'Modern web' },
                    { label: 'PNG', value: 'image/png', tip: 'Lossless' },
                  ].map((fmt) => (
                    <button
                      key={fmt.value}
                      onClick={() => setOutputFormat(fmt.value as any)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                        outputFormat === fmt.value
                          ? 'border-royalBlue bg-blue-50 dark:bg-blue-950/40 text-royalBlue dark:text-blue-300'
                          : 'border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {fmt.label}
                    </button>
                  ))}
                </div>
                {outputFormat === 'image/png' && mode === 'targetKb' && (
                  <p className="mt-2 text-[11px] text-amber-600 dark:text-amber-400">
                    Tip: PNG is lossless. If you need strict target sizes like 20 KB or 50 KB, JPEG is recommended.
                  </p>
                )}
              </div>
            </div>

            {/* Results & Download Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-md">
                {/* Result Top Badge */}
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                    <TrendingDown size={18} className="text-emerald-500" /> Compression Result
                  </h3>
                  {savingsPercent > 0 && (
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                      <TrendingDown size={13} /> {savingsPercent}% Smaller
                    </span>
                  )}
                </div>

                {/* Before vs After stats */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-gray-400 block uppercase">Original Size</span>
                    <span className="text-lg font-black text-gray-900 dark:text-white font-mono">
                      {metadata ? formatBytes(metadata.sizeBytes) : '—'}
                    </span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">
                      {metadata?.width} × {metadata?.height} px
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/50">
                    <span className="text-[11px] font-bold text-royalBlue dark:text-blue-400 block uppercase">
                      Compressed Size
                    </span>
                    <span className="text-lg font-black text-royalBlue dark:text-blue-300 font-mono">
                      {processedResult ? formatBytes(processedResult.sizeBytes) : 'Processing...'}
                    </span>
                    <span className="text-[10px] text-gray-500 block mt-0.5">
                      {processedResult?.width} × {processedResult?.height} px
                    </span>
                  </div>
                </div>

                {/* Image Preview Box */}
                <div className="h-64 sm:h-72 rounded-2xl bg-gray-100 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 flex items-center justify-center p-3 mb-6 overflow-hidden">
                  {processedResult?.blobUrl ? (
                    <img
                      src={processedResult.blobUrl}
                      alt="Compressed preview"
                      className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                    />
                  ) : (
                    <span className="text-xs text-gray-400 animate-pulse">Compressing image...</span>
                  )}
                </div>

                {/* Download Button */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleDownload}
                    disabled={!processedResult || isProcessing}
                    className="flex-1 bg-royalBlue hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                  >
                    <Download size={18} />
                    Download Compressed Image
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
                <Shield size={18} className="text-royalBlue shrink-0" />
                <span>
                  <strong>Client-Side Processing:</strong> No files are uploaded to our servers. All compression is executed instantly in your browser.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Compression Guide & FAQ */}
        <section className="mt-14 pt-8 border-t border-gray-200 dark:border-slate-800">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions About Image Compression
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2">
                How do I compress an image to 20 KB or 50 KB?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Simply select or enter "20 KB" or "50 KB" in the Target KB Size buttons. Our iterative compression algorithm tunes JPEG quality and dimensions automatically to achieve the target without pixelation.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2">
                Will my image look blurry after compression?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                No. The tool balances compression ratios with visual clarity. You can view the live before and after preview right on this page before downloading.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2">
                Which format is best for reaching small KB sizes?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                JPEG (or JPG) and WebP offer the best compression efficiency. PNG is lossless and produces larger files, so JPEG is recommended for strict KB limits.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2">
                Is there any file upload limit or watermark?
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                No watermarks, no registration, and no limits. The tool runs 100% free and client-side on your device.
              </p>
            </div>
          </div>
        </section>

        {/* Suggested Tools Section */}
        <SuggestedTools currentToolId="image-compressor" onNavigateToTool={onNavigateToTool} />

        {/* Bottom Banner Ad */}
        <div className="mt-12">
          <AdSenseUnit placementLabel="Image Compressor Bottom Banner" />
        </div>
      </div>
    </div>
  );
};

export default ImageCompressor;
