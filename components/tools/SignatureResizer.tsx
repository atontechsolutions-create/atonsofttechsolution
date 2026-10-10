import React, { useState, useEffect, useRef } from 'react';
import {
  PenTool,
  Upload,
  Download,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Unlock,
  Sliders,
  Maximize2,
  FileCheck,
  Shield,
  HelpCircle,
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

interface SignatureResizerProps {
  onNavigateHome: (sectionId?: string) => void;
  onNavigateToTool: (path: string) => void;
}

const SIGNATURE_PRESETS = [
  { label: '140 × 60 px (Govt/SSC/UPSC)', width: 140, height: 60, targetKb: 20 },
  { label: '200 × 100 px (Standard Form)', width: 200, height: 100, targetKb: 20 },
  { label: '300 × 100 px (Wide Signature)', width: 300, height: 100, targetKb: 50 },
  { label: '350 × 150 px (High Res Signature)', width: 350, height: 150, targetKb: 50 },
  { label: '160 × 70 px (Exam Portal)', width: 160, height: 70, targetKb: 20 },
];

const SignatureResizer: React.FC<SignatureResizerProps> = ({ onNavigateHome, onNavigateToTool }) => {
  const [file, setFile] = useState<File | null>(null);
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Signature Settings
  const [targetWidth, setTargetWidth] = useState<number>(140);
  const [targetHeight, setTargetHeight] = useState<number>(60);
  const [maintainAspect, setMaintainAspect] = useState<boolean>(false);
  const [backgroundChoice, setBackgroundChoice] = useState<'white' | 'transparent'>('white');
  const [targetKb, setTargetKb] = useState<number>(20);
  const [enableKbLimit, setEnableKbLimit] = useState<boolean>(true);
  const [enhanceContrast, setEnhanceContrast] = useState<boolean>(true);
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png'>('image/jpeg');

  // Processed state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processedResult, setProcessedResult] = useState<ProcessedImageResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // SEO setup
  useEffect(() => {
    document.title = 'Free Signature Resizer Online – Resize to 140x60 px & 20 KB';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Resize signatures online for government job exams, UPSC, SSC, IBPS, and college admission portals. Clean background, set dimensions like 140x60 px, and compress under 20 KB.'
      );
    }
  }, []);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
      if (processedResult?.blobUrl) URL.revokeObjectURL(processedResult.blobUrl);
    };
  }, [rawImageUrl, processedResult]);

  const handleFile = async (selectedFile: File) => {
    setErrorMsg(null);
    if (!selectedFile.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (JPG, JPEG, PNG, or WebP).');
      return;
    }
    if (selectedFile.size > 20 * 1024 * 1024) {
      setErrorMsg('Selected file is too large (>20 MB). Please pick an image under 20 MB.');
      return;
    }

    try {
      const meta = await readImageMetadata(selectedFile);
      if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
      const url = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setMetadata(meta);
      setRawImageUrl(url);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to read image.');
    }
  };

  // Process signature
  useEffect(() => {
    if (!file || !rawImageUrl) return;

    let isMounted = true;
    setIsProcessing(true);

    const timer = setTimeout(async () => {
      try {
        const result = await processImage(file, {
          targetWidth: Math.max(10, Number(targetWidth) || 140),
          targetHeight: Math.max(10, Number(targetHeight) || 60),
          maintainAspectRatio: maintainAspect,
          fitMode: 'contain',
          backgroundColor: backgroundChoice === 'white' ? '#FFFFFF' : 'transparent',
          targetKb: enableKbLimit ? targetKb : undefined,
          outputFormat: backgroundChoice === 'transparent' ? 'image/png' : outputFormat,
          enhanceContrast,
          contrastLevel: 1.25,
        });

        if (isMounted) {
          setProcessedResult(result);
          setIsProcessing(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || 'Processing failed.');
          setIsProcessing(false);
        }
      }
    }, 180);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [
    file,
    rawImageUrl,
    targetWidth,
    targetHeight,
    maintainAspect,
    backgroundChoice,
    targetKb,
    enableKbLimit,
    enhanceContrast,
    outputFormat,
  ]);

  const handleDownload = () => {
    if (!processedResult) return;
    const baseName = file?.name.replace(/\.[^/.]+$/, '') || 'signature';
    const ext = processedResult.format === 'image/png' ? 'png' : 'jpg';
    const filename = `signature-${baseName}-${targetWidth}x${targetHeight}.${ext}`;
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
    setTargetWidth(140);
    setTargetHeight(60);
    setMaintainAspect(false);
    setBackgroundChoice('white');
    setOutputFormat('image/jpeg');
    setTargetKb(20);
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
            <span className="text-gray-900 dark:text-white font-semibold">Signature Resizer</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="pt-10 pb-6 sm:pt-14 sm:pb-8 text-center bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-darkBg border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm font-semibold mb-3 border border-emerald-200 dark:border-emerald-800/40">
            <PenTool size={15} />
            Specific Tool • Signature Cropping, Background Clean & KB Control
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-gray-900 dark:text-white mb-3">
            Free Online Signature Resizer
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Resize your handwritten signature to exact exam dimensions (such as 140×60 px), clean faint background paper, and compress strictly under 10 KB or 20 KB.
          </p>
        </div>
      </section>

      {/* Top Ad Unit */}
      <AdSenseUnit placementLabel="Signature Resizer Top Banner" />

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
            className="border-2 border-dashed border-emerald-300 dark:border-emerald-700/60 hover:border-emerald-500 rounded-3xl p-8 sm:p-14 text-center cursor-pointer bg-emerald-50/30 dark:bg-emerald-950/10 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/20 transition-all shadow-sm"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
            />
            <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <Upload size={32} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
              Drop your signature image here, or browse
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
              Supports photos taken from mobile camera or scanned files (JPG, PNG, WebP).
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider">
              <Upload size={14} /> Select Signature File
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Controls Column */}
            <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-md space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center">
                    <Sliders size={18} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-base">Signature Settings</h3>
                </div>
                <button
                  onClick={handleReset}
                  className="text-xs text-gray-500 hover:text-red-500 font-semibold transition-colors flex items-center gap-1"
                >
                  <RotateCw size={12} /> Replace
                </button>
              </div>

              {/* Preset buttons */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Quick Dimensions Presets
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {SIGNATURE_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        setTargetWidth(p.width);
                        setTargetHeight(p.height);
                        setTargetKb(p.targetKb);
                        setMaintainAspect(false);
                      }}
                      className={`text-left px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        targetWidth === p.width && targetHeight === p.height
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                          : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Dimensions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Exact Dimensions (px)
                  </label>
                  <button
                    onClick={() => setMaintainAspect(!maintainAspect)}
                    className="text-xs text-royalBlue dark:text-blue-400 flex items-center gap-1 font-semibold"
                  >
                    {maintainAspect ? <Lock size={12} /> : <Unlock size={12} />}
                    {maintainAspect ? 'Aspect Locked' : 'Aspect Free'}
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-gray-500 block mb-1">Width (px)</span>
                    <input
                      type="number"
                      value={targetWidth}
                      onChange={(e) => setTargetWidth(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/60 font-mono text-sm text-gray-900 dark:text-white"
                      min={10}
                      max={2000}
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-gray-500 block mb-1">Height (px)</span>
                    <input
                      type="number"
                      value={targetHeight}
                      onChange={(e) => setTargetHeight(Number(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/60 font-mono text-sm text-gray-900 dark:text-white"
                      min={10}
                      max={2000}
                    />
                  </div>
                </div>
              </div>

              {/* Background Color & Clean Paper */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Background Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setBackgroundChoice('white');
                      setOutputFormat('image/jpeg');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      backgroundChoice === 'white'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Clean Pure White
                  </button>
                  <button
                    onClick={() => {
                      setBackgroundChoice('transparent');
                      setOutputFormat('image/png');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
                      backgroundChoice === 'transparent'
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Transparent (PNG)
                  </button>
                </div>
              </div>

              {/* Contrast Enhancement */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white block">
                    Darken Ink & Clean Paper
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    Boosts contrast so camera-clicked signatures look crisp.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enhanceContrast}
                  onChange={(e) => setEnhanceContrast(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
              </div>

              {/* Target File Size limit */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Max File Size Limit
                  </label>
                  <label className="text-xs text-gray-500 flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enableKbLimit}
                      onChange={(e) => setEnableKbLimit(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Enforce KB Limit</span>
                  </label>
                </div>

                {enableKbLimit && (
                  <div className="grid grid-cols-3 gap-2">
                    {[10, 20, 50].map((kb) => (
                      <button
                        key={kb}
                        onClick={() => setTargetKb(kb)}
                        className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          targetKb === kb
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'border-gray-200 dark:border-slate-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        ≤ {kb} KB
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Preview & Download Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-md">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800 mb-4">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                    <FileCheck size={18} className="text-emerald-500" /> Signature Preview
                  </h3>
                  {isProcessing ? (
                    <span className="text-xs text-emerald-600 animate-pulse font-semibold">
                      Processing...
                    </span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                      Ready
                    </span>
                  )}
                </div>

                {/* Side-by-Side or Compare */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {/* Original */}
                  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800">
                    <div className="text-xs font-bold text-gray-500 mb-2">Original Upload</div>
                    <div className="h-36 flex items-center justify-center overflow-hidden bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-2">
                      {rawImageUrl && (
                        <img
                          src={rawImageUrl}
                          alt="Original signature"
                          className="max-h-full max-w-full object-contain"
                        />
                      )}
                    </div>
                    {metadata && (
                      <div className="mt-3 text-[11px] text-gray-500 space-y-0.5">
                        <div>Dimensions: <span className="font-mono text-gray-700 dark:text-gray-300 font-bold">{metadata.width} × {metadata.height} px</span></div>
                        <div>Size: <span className="font-mono text-gray-700 dark:text-gray-300 font-bold">{formatBytes(metadata.sizeBytes)}</span></div>
                      </div>
                    )}
                  </div>

                  {/* Resized Result */}
                  <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
                    <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                      Processed Signature
                    </div>
                    <div className="h-36 flex items-center justify-center overflow-hidden bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-800 p-2">
                      {processedResult?.blobUrl ? (
                        <img
                          src={processedResult.blobUrl}
                          alt="Resized signature preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-xs text-gray-400">Processing...</div>
                      )}
                    </div>
                    {processedResult && (
                      <div className="mt-3 text-[11px] text-gray-600 dark:text-gray-300 space-y-0.5">
                        <div>Dimensions: <span className="font-mono font-bold text-emerald-600">{processedResult.width} × {processedResult.height} px</span></div>
                        <div>Size: <span className="font-mono font-bold text-emerald-600">{formatBytes(processedResult.sizeBytes)}</span></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Download Button */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleDownload}
                    disabled={!processedResult || isProcessing}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
                  >
                    <Download size={18} />
                    Download Resized Signature
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
                <Shield size={18} className="text-emerald-500 shrink-0" />
                <span>
                  <strong>100% Private & Client-Side:</strong> Your signature never leaves your device and is never uploaded to any remote server.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Instructions & Specs */}
        <section className="mt-14 pt-8 border-t border-gray-200 dark:border-slate-800">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Common Exam & Application Signature Specifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2">UPSC / SSC / Govt Jobs</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                Typically requires 140 × 60 px with a file size between 10 KB to 20 KB on clear white paper using black/blue ink.
              </p>
              <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                Preset: 140 × 60 px • ≤ 20 KB
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Bank PO / IBPS / SBI</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                Typically requires dimensions around 140 × 60 px or 200 × 100 px with file size restricted strictly between 10 KB and 20 KB.
              </p>
              <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                Preset: 140 × 60 px • 10-20 KB
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2">College Admissions & Visas</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
                Commonly accepts 200 × 100 px or 300 × 100 px with transparent background or pure white background up to 50 KB.
              </p>
              <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                Preset: 200 × 100 px • ≤ 50 KB
              </div>
            </div>
          </div>
        </section>

        {/* Suggested Tools Section */}
        <SuggestedTools currentToolId="signature-resizer" onNavigateToTool={onNavigateToTool} />

        {/* Bottom Banner Ad */}
        <div className="mt-12">
          <AdSenseUnit placementLabel="Signature Resizer Bottom Banner" />
        </div>
      </div>
    </div>
  );
};

export default SignatureResizer;
