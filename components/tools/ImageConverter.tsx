import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Sliders,
  Maximize2,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  ExternalLink,
  Code,
  Eye,
  FileImage,
  Layers,
  ArrowLeftRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  readImageMetadata,
  downloadBlob,
  formatBytes,
  ImageMetadata,
} from './imageProcessing';
import {
  canvasToBmpBlob,
  canvasToIcoBlob,
  canvasToTiffBlob,
} from './formatEncoders';
import {
  SUPPORTED_FORMATS,
  CORE_8_FORMATS,
  ALL_56_CONVERTER_ROUTES,
  SPECIAL_CONVERTER_ROUTES,
  getConverterPairInfo,
  ConverterRouteEntry,
} from './converterData';
import AdSenseUnit from './AdSenseUnit';
import SuggestedTools from './SuggestedTools';

interface ImageConverterProps {
  onNavigateHome: (sectionId?: string) => void;
  onNavigateToTool: (path: string) => void;
  activeSlug?: string;
}

const ImageConverter: React.FC<ImageConverterProps> = ({
  onNavigateHome,
  onNavigateToTool,
  activeSlug = 'image-converter',
}) => {
  // Determine current pair configuration based on activeSlug
  const pairInfo = useMemo(() => getConverterPairInfo(activeSlug), [activeSlug]);

  const [fromFormat, setFromFormat] = useState<string>(pairInfo.fromFormat);
  const [targetFormat, setTargetFormat] = useState<string>(pairInfo.toFormat);

  // Sync format states when route/slug changes
  useEffect(() => {
    setFromFormat(pairInfo.fromFormat);
    setTargetFormat(pairInfo.toFormat);
  }, [pairInfo]);

  // Image state
  const [file, setFile] = useState<File | null>(null);
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Conversion options
  const [quality, setQuality] = useState<number>(90);
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');
  const [icoSize, setIcoSize] = useState<number>(64);

  // Output state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number>(0);

  // Base64 specific state
  const [base64Output, setBase64Output] = useState<string>('');
  const [base64Input, setBase64Input] = useState<string>('');
  const [base64Copied, setBase64Copied] = useState<boolean>(false);
  const [htmlCopied, setHtmlCopied] = useState<boolean>(false);
  const [cssCopied, setCssCopied] = useState<boolean>(false);

  // UI state
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedDirectoryCategory, setSelectedDirectoryCategory] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isBase64ToImageMode = activeSlug === 'base64-to-image' || fromFormat === 'base64';
  const isImageToBase64Mode = activeSlug === 'image-to-base64' || targetFormat === 'base64';

  // Dynamic SEO metadata
  useEffect(() => {
    document.title = `${pairInfo.metaTitle} | Aton Tech Solutions`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', pairInfo.metaDescription);
    }
  }, [pairInfo]);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [rawImageUrl, outputUrl]);

  // Handle uploaded file
  const handleFile = async (selectedFile: File) => {
    setErrorMsg(null);
    if (selectedFile.size > 40 * 1024 * 1024) {
      setErrorMsg('Selected file is too large (>40 MB). Please choose an image below 40 MB.');
      return;
    }

    try {
      if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);

      const url = URL.createObjectURL(selectedFile);
      setFile(selectedFile);
      setRawImageUrl(url);

      // Read metadata if image
      if (selectedFile.type.startsWith('image/') || selectedFile.name.match(/\.(svg|bmp|tiff|tif|webp|ico|gif|png|jpe?g)$/i)) {
        try {
          const meta = await readImageMetadata(selectedFile);
          setMetadata(meta);
        } catch {
          // If metadata fails (e.g. specialized svg), set reasonable defaults
          setMetadata({
            width: 800,
            height: 600,
            format: selectedFile.type,
            sizeBytes: selectedFile.size,
            fileName: selectedFile.name,
            aspectRatio: 1.33,
          });
        }
      }

      // Generate Base64 string automatically
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setBase64Output(result || '');
      };
      reader.readAsDataURL(selectedFile);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to read image file.');
    }
  };

  // Convert image whenever options change
  useEffect(() => {
    if (!rawImageUrl || !file || isBase64ToImageMode) return;

    let isMounted = true;
    setIsProcessing(true);

    const timer = setTimeout(async () => {
      try {
        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('Failed to render source image onto canvas'));
          img.src = rawImageUrl;
        });

        const canvas = document.createElement('canvas');
        const w = img.naturalWidth || img.width || 800;
        const h = img.naturalHeight || img.height || 600;
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get 2D canvas context');

        // Fill background color if target doesn't support alpha transparency (JPG, BMP)
        const targetSpec = SUPPORTED_FORMATS[targetFormat];
        if (!targetSpec?.transparency || bgColor !== 'transparent') {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, w, h);
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, w, h);

        let convertedBlob: Blob;

        // Custom format encoding
        if (targetFormat === 'bmp') {
          convertedBlob = canvasToBmpBlob(canvas);
        } else if (targetFormat === 'ico') {
          convertedBlob = await canvasToIcoBlob(canvas, icoSize);
        } else if (targetFormat === 'tiff') {
          convertedBlob = canvasToTiffBlob(canvas);
        } else if (targetFormat === 'avif') {
          convertedBlob = await new Promise<Blob>((resolve) => {
            canvas.toBlob(
              (blob) => {
                if (blob) resolve(blob);
                else {
                  // Graceful fallback to high quality WebP container
                  canvas.toBlob(
                    (fallback) => resolve(fallback || new Blob([])),
                    'image/webp',
                    quality / 100
                  );
                }
              },
              'image/avif',
              quality / 100
            );
          });
        } else if (targetFormat === 'gif') {
          convertedBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('GIF export not supported'));
              },
              'image/gif'
            );
          });
        } else if (targetFormat === 'png') {
          convertedBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('PNG conversion failed'));
              },
              'image/png'
            );
          });
        } else if (targetFormat === 'webp') {
          convertedBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('WebP conversion failed'));
              },
              'image/webp',
              quality / 100
            );
          });
        } else {
          // Default to JPG
          convertedBlob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (blob) => {
                if (blob) resolve(blob);
                else reject(new Error('JPEG conversion failed'));
              },
              'image/jpeg',
              quality / 100
            );
          });
        }

        if (isMounted) {
          if (outputUrl) URL.revokeObjectURL(outputUrl);
          const newUrl = URL.createObjectURL(convertedBlob);
          setOutputBlob(convertedBlob);
          setOutputUrl(newUrl);
          setOutputSize(convertedBlob.size);
          setIsProcessing(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMsg(err.message || 'Image conversion failed.');
          setIsProcessing(false);
        }
      }
    }, 120);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [rawImageUrl, file, targetFormat, quality, bgColor, icoSize, isBase64ToImageMode]);

  // Handle Base64-to-Image Decoding
  const handleDecodeBase64 = () => {
    setErrorMsg(null);
    if (!base64Input.trim()) {
      setErrorMsg('Please enter or paste a valid Base64 string or Data URI.');
      return;
    }

    try {
      let dataUri = base64Input.trim();
      if (!dataUri.startsWith('data:image/')) {
        // Automatically prepend standard data uri prefix
        dataUri = `data:image/png;base64,${dataUri.replace(/^data:[^;]+;base64,/, '')}`;
      }

      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (!blob) return;
          if (outputUrl) URL.revokeObjectURL(outputUrl);
          const url = URL.createObjectURL(blob);
          setOutputBlob(blob);
          setOutputUrl(url);
          setOutputSize(blob.size);
          setMetadata({
            width: canvas.width,
            height: canvas.height,
            format: 'image/png',
            sizeBytes: blob.size,
            fileName: 'decoded-base64-image.png',
            aspectRatio: canvas.width / canvas.height,
          });
          toast.success('Base64 decoded successfully!');
        }, 'image/png');
      };

      img.onerror = () => {
        setErrorMsg('Invalid Base64 image payload. Please verify your string.');
      };

      img.src = dataUri;
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to decode Base64 string.');
    }
  };

  // Download converted file
  const handleDownload = () => {
    if (!outputBlob) return;
    const baseName = file?.name ? file.name.replace(/\.[^/.]+$/, '') : 'converted-image';
    const ext = SUPPORTED_FORMATS[targetFormat]?.ext || targetFormat;
    const filename = `${baseName}.${ext}`;
    downloadBlob(outputBlob, filename);
    toast.success(`Downloaded ${filename}!`);
  };

  // Handle format change from dropdowns
  const handleFromFormatChange = (newFrom: string) => {
    setFromFormat(newFrom);
    if (newFrom === targetFormat) {
      const fallbackTarget = newFrom === 'png' ? 'jpg' : 'png';
      setTargetFormat(fallbackTarget);
      onNavigateToTool(`/tools/${newFrom}-to-${fallbackTarget}`);
    } else {
      onNavigateToTool(`/tools/${newFrom}-to-${targetFormat}`);
    }
  };

  const handleTargetFormatChange = (newTo: string) => {
    setTargetFormat(newTo);
    if (newTo === fromFormat) {
      const fallbackFrom = newTo === 'jpg' ? 'png' : 'jpg';
      setFromFormat(fallbackFrom);
      onNavigateToTool(`/tools/${fallbackFrom}-to-${newTo}`);
    } else {
      onNavigateToTool(`/tools/${fromFormat}-to-${newTo}`);
    }
  };

  // Swap From and To formats
  const handleSwapFormats = () => {
    const newSlug = `${targetFormat}-to-${fromFormat}`;
    onNavigateToTool(`/tools/${newSlug}`);
  };

  // Reset tool
  const handleReset = () => {
    if (rawImageUrl) URL.revokeObjectURL(rawImageUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setFile(null);
    setRawImageUrl(null);
    setMetadata(null);
    setOutputBlob(null);
    setOutputUrl(null);
    setOutputSize(0);
    setErrorMsg(null);
    setBase64Output('');
    setBase64Input('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Clipboard helpers
  const copyToClipboard = (text: string, type: 'base64' | 'html' | 'css') => {
    navigator.clipboard.writeText(text);
    if (type === 'base64') {
      setBase64Copied(true);
      setTimeout(() => setBase64Copied(false), 2000);
    } else if (type === 'html') {
      setHtmlCopied(true);
      setTimeout(() => setHtmlCopied(false), 2000);
    } else if (type === 'css') {
      setCssCopied(true);
      setTimeout(() => setCssCopied(false), 2000);
    }
    toast.success('Copied to clipboard!');
  };

  // Filtered 56-route directory
  const filteredDirectory = useMemo(() => {
    return ALL_56_CONVERTER_ROUTES.filter((route) => {
      const matchesSearch =
        route.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        route.slug.toLowerCase().includes(searchFilter.toLowerCase()) ||
        route.desc.toLowerCase().includes(searchFilter.toLowerCase());

      if (selectedDirectoryCategory === 'all') return matchesSearch;
      return matchesSearch && route.from === selectedDirectoryCategory;
    });
  }, [searchFilter, selectedDirectoryCategory]);

  // Related converters for quick linking
  const relatedConverters = useMemo(() => {
    return ALL_56_CONVERTER_ROUTES.filter(
      (r) => (r.from === fromFormat || r.to === targetFormat) && r.slug !== activeSlug
    ).slice(0, 6);
  }, [fromFormat, targetFormat, activeSlug]);

  const fromSpec = SUPPORTED_FORMATS[fromFormat] || SUPPORTED_FORMATS.jpg;
  const toSpec = SUPPORTED_FORMATS[targetFormat] || SUPPORTED_FORMATS.png;

  return (
    <div className="w-full">
      {/* Breadcrumb Navigation */}
      <div className="bg-gray-50 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-800 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <button
              onClick={() => onNavigateHome('home')}
              className="hover:text-vibrantOrange font-medium transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <button
              onClick={() => onNavigateToTool('/tools')}
              className="hover:text-vibrantOrange font-medium transition-colors"
            >
              Tools
            </button>
            <span>/</span>
            <button
              onClick={() => onNavigateToTool('/tools/image-converter')}
              className="hover:text-vibrantOrange font-medium transition-colors"
            >
              Image Converters
            </button>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-semibold truncate max-w-[200px] sm:max-w-none">
              {pairInfo.title}
            </span>
          </nav>
        </div>
      </div>

      {/* Header Banner */}
      <section className="pt-8 pb-6 sm:pt-12 sm:pb-8 text-center bg-gradient-to-b from-purple-50/40 via-white to-gray-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-darkBg border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs sm:text-sm font-semibold mb-3 border border-purple-200 dark:border-purple-800/50 shadow-sm">
            <RefreshCw size={14} className="animate-spin-slow" />
            <span>Format Conversion Suite • 100% In-Browser & Private</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-gray-900 dark:text-white mb-3">
            {pairInfo.h1}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            {pairInfo.tagline}
          </p>

          {/* Shortcut Dropdown Selectors for Easy Image Type Selection */}
          <div className="mt-6 inline-flex flex-col sm:flex-row items-center gap-3 p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-slate-800/90 border border-purple-200/80 dark:border-slate-700 shadow-lg shadow-purple-500/5 max-w-2xl mx-auto">
            {/* FROM DROPDOWN */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 w-full sm:w-auto">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 whitespace-nowrap">
                Convert From:
              </span>
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={fromFormat}
                  onChange={(e) => handleFromFormatChange(e.target.value)}
                  className="w-full sm:w-auto appearance-none bg-white dark:bg-slate-900 font-bold text-xs sm:text-sm text-gray-900 dark:text-white py-1.5 pl-3 pr-8 rounded-lg border border-purple-200 dark:border-purple-800 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer shadow-sm"
                  aria-label="Select source image format"
                >
                  <option value="jpg">JPG / JPEG (.jpg)</option>
                  <option value="png">PNG (.png)</option>
                  <option value="webp">WebP (.webp)</option>
                  <option value="gif">GIF (.gif)</option>
                  <option value="bmp">BMP (.bmp)</option>
                  <option value="tiff">TIFF (.tiff)</option>
                  <option value="ico">ICO (.ico)</option>
                  <option value="avif">AVIF (.avif)</option>
                  <option value="heic">HEIC (iPhone .heic)</option>
                  <option value="svg">SVG Vector (.svg)</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* SWAP BUTTON */}
            <button
              onClick={handleSwapFormats}
              title="Swap From and To image formats"
              className="p-2 rounded-xl bg-gray-100 hover:bg-purple-100 dark:bg-slate-700 dark:hover:bg-purple-900/40 text-purple-600 dark:text-purple-300 transition-all active:scale-95 border border-transparent hover:border-purple-300 shadow-sm"
              aria-label="Swap format directions"
            >
              <ArrowLeftRight size={16} />
            </button>

            {/* TO DROPDOWN */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-600/10 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 w-full sm:w-auto">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 whitespace-nowrap">
                Convert To:
              </span>
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={targetFormat}
                  onChange={(e) => handleTargetFormatChange(e.target.value)}
                  className="w-full sm:w-auto appearance-none bg-purple-600 text-white font-bold text-xs sm:text-sm py-1.5 pl-3 pr-8 rounded-lg border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-400 cursor-pointer shadow-sm"
                  aria-label="Select target image format"
                >
                  <option value="png" className="bg-white text-gray-900 dark:bg-slate-900 dark:text-white">PNG (.png) — Lossless</option>
                  <option value="jpg" className="bg-white text-gray-900 dark:bg-slate-900 dark:text-white">JPG (.jpg) — Universal</option>
                  <option value="webp" className="bg-white text-gray-900 dark:bg-slate-900 dark:text-white">WebP (.webp) — Next-Gen</option>
                  <option value="gif" className="bg-white text-gray-900 dark:bg-slate-900 dark:text-white">GIF (.gif) — Graphics</option>
                  <option value="bmp" className="bg-white text-gray-900 dark:bg-slate-900 dark:text-white">BMP (.bmp) — Raw Bitmap</option>
                  <option value="tiff" className="bg-white text-gray-900 dark:bg-slate-900 dark:text-white">TIFF (.tiff) — Print Quality</option>
                  <option value="ico" className="bg-white text-gray-900 dark:bg-slate-900 dark:text-white">ICO (.ico) — Favicon</option>
                  <option value="avif" className="bg-white text-gray-900 dark:bg-slate-900 dark:text-white">AVIF (.avif) — High Efficiency</option>
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-200 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Quick Shortcuts Pill Row */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 max-w-3xl mx-auto px-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mr-1 flex items-center gap-1">
              <Sparkles size={12} className="text-vibrantOrange" /> Shortcuts:
            </span>
            {[
              { label: 'JPG to PNG', slug: 'jpg-to-png' },
              { label: 'PNG to JPG', slug: 'png-to-jpg' },
              { label: 'JPG to WebP', slug: 'jpg-to-webp' },
              { label: 'WebP to JPG', slug: 'webp-to-jpg' },
              { label: 'PNG to WebP', slug: 'png-to-webp' },
              { label: 'HEIC to JPG', slug: 'heic-to-jpg' },
              { label: 'JPG to ICO', slug: 'jpg-to-ico' },
              { label: 'PNG to ICO', slug: 'png-to-ico' },
              { label: 'Image to PDF', path: '/tools/image-to-pdf' },
              { label: 'Image to Base64', path: '/tools/image-to-base64' },
            ].map((shortcut) => {
              const isCurrent = activeSlug === shortcut.slug;
              return (
                <button
                  key={shortcut.label}
                  onClick={() => {
                    if (shortcut.path) {
                      onNavigateToTool(shortcut.path);
                    } else if (shortcut.slug) {
                      onNavigateToTool(`/tools/${shortcut.slug}`);
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                    isCurrent
                      ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                      : 'bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-300'
                  }`}
                >
                  {shortcut.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top Ad Unit */}
      <AdSenseUnit placementLabel="Image Converter Top Banner" />

      {/* Main Workspace */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Notification */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-center gap-3 text-red-700 dark:text-red-300 text-sm">
            <AlertCircle size={18} className="shrink-0" />
            <span className="flex-1 font-medium">{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-xs font-bold hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* MODE A: Standard Image File Conversion */}
        {!isBase64ToImageMode ? (
          <div>
            {!file ? (
              /* Drag & Drop Upload Zone */
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-purple-300 dark:border-purple-700/60 hover:border-purple-500 rounded-3xl p-8 sm:p-14 text-center cursor-pointer bg-purple-50/20 dark:bg-purple-950/10 hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-all shadow-sm"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                  accept="image/*,.heic,.heif,.svg,.bmp,.tiff,.tif,.ico,.webp,.gif,.png,.jpg,.jpeg"
                  className="hidden"
                />
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                  <Upload size={32} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Drop your {fromSpec.shortName} image here, or browse
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-md mx-auto">
                  Instant conversion to {toSpec.name}. Supports all major formats up to 40 MB.
                </p>
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider shadow-md transition-all">
                  <Upload size={14} /> Select {fromSpec.shortName} File
                </div>
              </div>
            ) : (
              /* Active Converter Interface */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Settings and Controls */}
                <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-md space-y-6">
                  {/* File Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 flex items-center justify-center shrink-0">
                        <FileImage size={20} />
                      </div>
                      <div className="truncate">
                        <p className="text-xs text-gray-400 font-medium">Source Image</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{file.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleReset}
                      className="text-xs text-gray-500 hover:text-red-500 font-semibold transition-colors flex items-center gap-1 shrink-0"
                    >
                      <RotateCw size={12} /> Replace
                    </button>
                  </div>

                  {/* Target Format Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2.5">
                      Target Output Format
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {CORE_8_FORMATS.map((fmtId) => {
                        const fmt = SUPPORTED_FORMATS[fmtId];
                        const isSelected = targetFormat === fmtId;
                        return (
                          <button
                            key={fmtId}
                            onClick={() => {
                              setTargetFormat(fmtId);
                              onNavigateToTool(`/tools/${fromFormat}-to-${fmtId}`);
                            }}
                            className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                              isSelected
                                ? 'bg-purple-600 text-white border-purple-600 shadow-md scale-[1.02]'
                                : 'bg-gray-50 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:border-purple-300'
                            }`}
                          >
                            {fmt.shortName}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Format-specific configurations */}
                  {(targetFormat === 'jpg' || targetFormat === 'webp' || targetFormat === 'avif') && (
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 space-y-3">
                      <div className="flex justify-between items-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                        <span>Output Quality</span>
                        <span className="text-purple-600 dark:text-purple-400 font-bold">{quality}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="w-full accent-purple-600 h-2 bg-gray-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                      />
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        Higher quality preserves razor-sharp details; lower quality yields smaller file sizes.
                      </p>
                    </div>
                  )}

                  {/* ICO Size Selector */}
                  {targetFormat === 'ico' && (
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 space-y-3">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                        Favicon / Icon Canvas Size
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[16, 32, 48, 64, 128, 256].map((sz) => (
                          <button
                            key={sz}
                            onClick={() => setIcoSize(sz)}
                            className={`py-1.5 text-xs font-semibold rounded-lg border ${
                              icoSize === sz
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-700'
                            }`}
                          >
                            {sz}×{sz} px
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Background Fill for Non-transparent Formats (JPG, BMP) */}
                  {(targetFormat === 'jpg' || targetFormat === 'bmp') && (
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 space-y-2">
                      <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                        Background Fill (Replaces Transparency)
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setBgColor('#FFFFFF')}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border ${
                            bgColor === '#FFFFFF'
                              ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold dark:bg-purple-950/30 dark:text-purple-300'
                              : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          Pure White
                        </button>
                        <button
                          onClick={() => setBgColor('#000000')}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border ${
                            bgColor === '#000000'
                              ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold dark:bg-purple-950/30 dark:text-purple-300'
                              : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          Deep Black
                        </button>
                        <input
                          type="color"
                          value={bgColor === 'transparent' ? '#FFFFFF' : bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="w-9 h-8 p-0 rounded-lg cursor-pointer border border-gray-300 dark:border-slate-700"
                        />
                      </div>
                    </div>
                  )}

                  {/* Download Action */}
                  <div className="pt-2">
                    <button
                      onClick={handleDownload}
                      disabled={isProcessing || !outputBlob}
                      className="w-full py-3.5 px-6 rounded-2xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-purple-600/25 transition-all"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw size={18} className="animate-spin" />
                          Processing {toSpec.shortName}...
                        </>
                      ) : (
                        <>
                          <Download size={18} />
                          Download Converted {toSpec.shortName}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Right Column: Live Comparison & Preview */}
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-md space-y-6">
                  {/* File Comparison Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                        Original ({fromSpec.shortName})
                      </span>
                      <span className="text-lg font-black text-gray-900 dark:text-white mt-1 block">
                        {file ? formatBytes(file.size) : '0 KB'}
                      </span>
                      {metadata && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {metadata.width} × {metadata.height} px
                        </span>
                      )}
                    </div>
                    <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/30">
                      <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                        Converted ({toSpec.shortName})
                      </span>
                      <span className="text-lg font-black text-purple-700 dark:text-purple-300 mt-1 block">
                        {outputSize > 0 ? formatBytes(outputSize) : 'Processing...'}
                      </span>
                      {outputSize > 0 && file && (
                        <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                          {outputSize < file.size ? (
                            <span className="text-emerald-600 dark:text-emerald-400">
                              ↓ {Math.round(((file.size - outputSize) / file.size) * 100)}% smaller
                            </span>
                          ) : (
                            <span className="text-amber-600 dark:text-amber-400">
                              ↑ {Math.round(((outputSize - file.size) / file.size) * 100)}% lossless scale
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Visual Preview */}
                  <div className="border border-gray-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-checkered p-4 flex items-center justify-center min-h-[300px] max-h-[460px]">
                    {outputUrl ? (
                      <img
                        src={outputUrl}
                        alt="Converted output preview"
                        className="max-h-[420px] max-w-full object-contain rounded-xl shadow-sm"
                      />
                    ) : rawImageUrl ? (
                      <img
                        src={rawImageUrl}
                        alt="Source preview"
                        className="max-h-[420px] max-w-full object-contain rounded-xl shadow-sm"
                      />
                    ) : null}
                  </div>

                  {/* Instant Base64 Snippets (Bonus utility for every conversion) */}
                  {base64Output && (
                    <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                          <Code size={14} className="text-purple-600" />
                          Base64 Data URI & HTML Embed Codes
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {base64Output.length.toLocaleString()} characters
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => copyToClipboard(base64Output, 'base64')}
                          className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-purple-400 text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          {base64Copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                          Data URI
                        </button>
                        <button
                          onClick={() =>
                            copyToClipboard(
                              `<img src="${base64Output}" alt="${file.name.replace(/\.[^/.]+$/, '')}" />`,
                              'html'
                            )
                          }
                          className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-purple-400 text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          {htmlCopied ? <Check size={13} className="text-emerald-500" /> : <Code size={13} />}
                          &lt;img&gt; Tag
                        </button>
                        <button
                          onClick={() =>
                            copyToClipboard(`background-image: url('${base64Output}');`, 'css')
                          }
                          className="py-2 px-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:border-purple-400 text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center justify-center gap-1.5 transition-colors"
                        >
                          {cssCopied ? <Check size={13} className="text-emerald-500" /> : <Layers size={13} />}
                          CSS URL
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* MODE B: Base64 to Image Decoder */
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-slate-800 shadow-md space-y-6">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Decode Base64 String to Downloadable Image
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                Paste your Base64 Data URI or raw base64 string to render, preview, and download as PNG or JPG.
              </p>
            </div>

            <div className="space-y-3">
              <textarea
                value={base64Input}
                onChange={(e) => setBase64Input(e.target.value)}
                placeholder="Paste base64 string here (e.g., data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...)"
                rows={5}
                className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs font-mono text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleDecodeBase64}
                  className="py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md"
                >
                  <Eye size={15} /> Decode & Preview Image
                </button>
                <button
                  onClick={() => setBase64Input('')}
                  className="py-3 px-4 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-semibold text-xs"
                >
                  Clear
                </button>
              </div>
            </div>

            {outputUrl && (
              <div className="p-6 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    Decoded Preview: {metadata?.width} × {metadata?.height} px ({formatBytes(outputSize)})
                  </span>
                  <button
                    onClick={handleDownload}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md"
                  >
                    <Download size={14} /> Download Decoded PNG
                  </button>
                </div>
                <div className="flex justify-center bg-checkered p-4 rounded-xl max-h-[360px] overflow-hidden">
                  <img src={outputUrl} alt="Decoded preview" className="max-h-[320px] object-contain rounded-lg shadow-sm" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* SECTION 1: Technical Breakdown - Why Convert From to To */}
        <section className="mt-14 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-gray-900 dark:text-white mb-3">
              Why Convert {fromSpec.shortName} to {toSpec.shortName}?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
              {pairInfo.whyConvert}
            </p>
          </div>

          {/* Format Comparison Matrix */}
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                  <th className="py-3 px-4 font-bold text-gray-700 dark:text-gray-300">Technical Property</th>
                  <th className="py-3 px-4 font-bold text-purple-700 dark:text-purple-300">
                    Source: {fromSpec.name}
                  </th>
                  <th className="py-3 px-4 font-bold text-emerald-700 dark:text-emerald-300">
                    Target: {toSpec.name}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-gray-600 dark:text-gray-300">
                <tr>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Compression Type</td>
                  <td className="py-3 px-4">{fromSpec.compression}</td>
                  <td className="py-3 px-4 font-medium text-emerald-600 dark:text-emerald-400">
                    {toSpec.compression}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Color Depth</td>
                  <td className="py-3 px-4">{fromSpec.colorDepth}</td>
                  <td className="py-3 px-4">{toSpec.colorDepth}</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Transparency (Alpha)</td>
                  <td className="py-3 px-4">
                    {fromSpec.transparency ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Supported</span>
                    ) : (
                      <span className="text-gray-400">No (Opaque)</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {toSpec.transparency ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Supported</span>
                    ) : (
                      <span className="text-gray-400">No (Solid background)</span>
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Primary Best Use</td>
                  <td className="py-3 px-4 text-xs">{fromSpec.bestFor}</td>
                  <td className="py-3 px-4 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    {toSpec.bestFor}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 2: How-To Steps */}
        <section className="mt-12">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-black font-display text-gray-900 dark:text-white">
              How to Convert {fromSpec.shortName} to {toSpec.shortName}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
              Three simple steps with instant private processing directly in your browser.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pairInfo.howToSteps.map((s) => (
              <div
                key={s.step}
                className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-200 dark:border-slate-800 shadow-sm relative space-y-3"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 font-black text-sm flex items-center justify-center">
                  {s.step}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">{s.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: Key Features & Advantages */}
        <section className="mt-12 bg-purple-50/50 dark:bg-slate-900/60 rounded-3xl p-6 sm:p-10 border border-purple-100 dark:border-slate-800">
          <h2 className="text-xl sm:text-2xl font-black font-display text-gray-900 dark:text-white mb-6">
            Key Advantages of Our {pairInfo.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pairInfo.features.map((feat, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xs">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">{feat}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: Related Converters Quick Grid */}
        {relatedConverters.length > 0 && (
          <section className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black font-display text-gray-900 dark:text-white">
                  Popular Related Converters
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Quick switch to alternative formats for your workflow
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedConverters.map((rc) => (
                <button
                  key={rc.slug}
                  onClick={() => onNavigateToTool(`/tools/${rc.slug}`)}
                  className="text-left p-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-600 transition-all shadow-xs group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                      {rc.name}
                    </span>
                    <ArrowRight size={14} className="text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">{rc.desc}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 5: FAQs */}
        <section className="mt-12">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-2xl sm:text-3xl font-black font-display text-gray-900 dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-2">
              Everything you need to know about {fromSpec.shortName} and {toSpec.shortName} conversions.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {pairInfo.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full py-4 px-5 text-left flex items-center justify-between text-sm sm:text-base font-bold text-gray-900 dark:text-white hover:text-purple-600 transition-colors"
                  >
                    <span>{faq.question}</span>
                    {isOpen ? <ChevronUp size={18} className="shrink-0 text-purple-600" /> : <ChevronDown size={18} className="shrink-0 text-gray-400" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-slate-800/60 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 6: Complete 56-Converter Interactive Directory */}
        <section className="mt-16 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-slate-800">
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-display text-gray-900 dark:text-white">
                Complete Directory of All 56 Format Converters
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Explore individual dedicated converter pages for every image format pair.
              </p>
            </div>

            {/* Search Filter */}
            <div className="relative min-w-[260px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search e.g. 'webp', 'ico'..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Filter Pills by Input Format */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedDirectoryCategory('all')}
              className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedDirectoryCategory === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              All Formats ({ALL_56_CONVERTER_ROUTES.length})
            </button>
            {CORE_8_FORMATS.map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedDirectoryCategory(fmt)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-colors uppercase ${
                  selectedDirectoryCategory === fmt
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {fmt} Sources (7)
              </button>
            ))}
          </div>

          {/* Grid of 56 Format Converter Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredDirectory.map((entry) => {
              const isCurrent = entry.slug === activeSlug;
              return (
                <button
                  key={entry.slug}
                  onClick={() => onNavigateToTool(`/tools/${entry.slug}`)}
                  className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 shadow-sm'
                      : 'border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 hover:border-purple-400 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {entry.name}
                    </span>
                    <ArrowRight size={12} className="text-gray-400 shrink-0" />
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">{entry.desc}</p>
                </button>
              );
            })}
          </div>

          {/* Special Converters Section */}
          <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
              Special Converters & Utilities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {SPECIAL_CONVERTER_ROUTES.map((sp) => (
                <button
                  key={sp.slug}
                  onClick={() => onNavigateToTool(`/tools/${sp.slug}`)}
                  className="text-left p-3.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 hover:border-purple-400 hover:bg-white dark:hover:bg-slate-800 transition-all"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">{sp.name}</span>
                    <Sparkles size={12} className="text-purple-500 shrink-0" />
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">{sp.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Bottom Ad Unit */}
        <div className="mt-12">
          <AdSenseUnit placementLabel="Image Converter Bottom Banner" />
        </div>

        {/* Suggested Tools */}
        <div className="mt-12">
          <SuggestedTools currentToolId="image-converter" onNavigateToTool={onNavigateToTool} />
        </div>
      </div>
    </div>
  );
};

export default ImageConverter;
