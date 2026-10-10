import React, { useState, useEffect, useRef, useId } from 'react';
import {
  Upload,
  Download,
  Image as ImageIcon,
  PenTool,
  RotateCw,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Shield,
  FileCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Trash2,
  Sliders,
  Crop,
  ArrowRight,
  Info,
  Maximize2,
  Minimize2
} from 'lucide-react';
import AdSenseUnit from './AdSenseUnit';
import SuggestedTools from './SuggestedTools';
import {
  processImage,
  formatFileSize,
  ResizeOptions,
  ProcessResult,
  ImageMetadata
} from './imageProcessing';

interface PresetItem {
  id: string;
  name: string;
  width: number;
  height: number;
  targetKb?: number;
  format: 'image/jpeg' | 'image/png' | 'image/webp';
  description: string;
}

const PHOTO_PRESETS: PresetItem[] = [
  {
    id: 'exam-standard',
    name: '200 × 230 px (Standard Exam / Form)',
    width: 200,
    height: 230,
    targetKb: 50,
    format: 'image/jpeg',
    description: 'Common general dimension for many online government & banking exam forms.',
  },
  {
    id: 'passport-standard',
    name: '413 × 531 px (Passport 3.5 × 4.5 cm)',
    width: 413,
    height: 531,
    targetKb: 50,
    format: 'image/jpeg',
    description: 'Standard passport aspect ratio (approx 3.5cm × 4.5cm at 300 DPI).',
  },
  {
    id: 'square-300',
    name: '300 × 300 px (Square Application)',
    width: 300,
    height: 300,
    targetKb: 50,
    format: 'image/jpeg',
    description: 'Common square format for admission portals and applicant profiles.',
  },
  {
    id: 'square-350',
    name: '350 × 350 px (Square Standard)',
    width: 350,
    height: 350,
    targetKb: 100,
    format: 'image/jpeg',
    description: 'Square photo size used by many state recruitment portals.',
  },
  {
    id: 'us-visa',
    name: '600 × 600 px (US Visa / 2×2 Inch)',
    width: 600,
    height: 600,
    targetKb: 200,
    format: 'image/jpeg',
    description: 'High-resolution square standard for international visa submissions.',
  },
];

const SIGNATURE_PRESETS: PresetItem[] = [
  {
    id: 'sig-140-60',
    name: '140 × 60 px (Compact Signature)',
    width: 140,
    height: 60,
    targetKb: 20,
    format: 'image/jpeg',
    description: 'Popular compact size for competitive exams and recruitment portals.',
  },
  {
    id: 'sig-200-100',
    name: '200 × 100 px (Standard 2:1 Signature)',
    width: 200,
    height: 100,
    targetKb: 20,
    format: 'image/jpeg',
    description: 'Balanced wide format for clear signature verification.',
  },
  {
    id: 'sig-200-60',
    name: '200 × 60 px (Slim Signature)',
    width: 200,
    height: 60,
    targetKb: 20,
    format: 'image/jpeg',
    description: 'Wide horizontal signature box for bank & exam uploads.',
  },
  {
    id: 'sig-300-100',
    name: '300 × 100 px (High-Definition Signature)',
    width: 300,
    height: 100,
    targetKb: 50,
    format: 'image/jpeg',
    description: 'Higher clarity signature format for university admissions and documents.',
  },
];

const TARGET_KB_OPTIONS = [10, 20, 50, 100, 200];

interface Props {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

export const PhotoSignatureResizer: React.FC<Props> = ({ onNavigateHome, onNavigateToTool }) => {
  const fileInputId = useId();
  // Tool Mode: 'photo' or 'signature'
  const [mode, setMode] = useState<'photo' | 'signature'>('photo');

  // Image Source & Metadata
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);

  // Resize Dimensions
  const [targetWidth, setTargetWidth] = useState<number>(200);
  const [targetHeight, setTargetHeight] = useState<number>(230);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState<boolean>(false);
  const [aspectRatioValue, setAspectRatioValue] = useState<number>(200 / 230);
  const [fitMode, setFitMode] = useState<'fit' | 'cover' | 'fill'>('fit');
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFFFFF');
  const [rotation, setRotation] = useState<number>(0);

  // Signature Specific Settings
  const [trimBorders, setTrimBorders] = useState<boolean>(true);
  const [enhanceContrast, setEnhanceContrast] = useState<boolean>(true);

  // Compression & Format Settings
  const [targetKb, setTargetKb] = useState<number | null>(50);
  const [customKbInput, setCustomKbInput] = useState<string>('50');
  const [isCustomKb, setIsCustomKb] = useState<boolean>(false);
  const [outputFormat, setOutputFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
  const [quality, setQuality] = useState<number>(0.85);
  const [autoScaleIfOverTargetKb, setAutoScaleIfOverTargetKb] = useState<boolean>(true);

  // Processing Status & Results
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processResult, setProcessResult] = useState<ProcessResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('exam-standard');

  // UI state
  const [activePreviewTab, setActivePreviewTab] = useState<'comparison' | 'processed' | 'original'>('comparison');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const prevResultUrlRef = useRef<string | null>(null);

  // SEO setup when mounting this component
  useEffect(() => {
    const originalTitle = document.title;
    const pageTitle = 'Free Photo & Signature Resizer Online – Compress to KB | ATON TECH Solutions';
    document.title = pageTitle;

    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc ? metaDesc.getAttribute('content') : '';
    const newDesc =
      'Resize photos and signatures online for application forms and exams. Set custom dimensions, compress images to a target KB size, preview results, and download.';
    if (metaDesc) {
      metaDesc.setAttribute('content', newDesc);
    }

    // Add JSON-LD Schema
    const scriptTag = document.createElement('script');
    scriptTag.type = 'application/ld+json';
    scriptTag.id = 'photo-resizer-schema';
    scriptTag.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          'name': 'Photo & Signature Resizer Online',
          'url': 'https://www.atontechsolutions.com/tools/photo-signature-resizer',
          'applicationCategory': 'UtilitiesApplication',
          'operatingSystem': 'Any',
          'offers': {
            '@type': 'Offer',
            'price': '0',
            'priceCurrency': 'USD'
          },
          'description':
            'Free online photo and signature resizer with precise pixel dimensions, aspect ratio controls, and KB size compressor for job, exam, and visa forms.'
        },
        {
          '@type': 'FAQPage',
          'mainEntity': [
            {
              '@type': 'Question',
              'name': 'How can I resize a photo online?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Upload your photo, choose your target pixel width and height or select a standard preset, set your target file size in KB if required, and click Download Photo.'
              }
            },
            {
              '@type': 'Question',
              'name': 'How can I compress a photo to 20 KB?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Select or enter 20 KB as your target file size. Our client-side compression engine iteratively optimizes image encoding and quality to meet the target KB limit without uploading your photo to any server.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Can I resize my signature to a specific size?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'Yes! Switch to Signature Resizer mode, enter required dimensions like 140x60 px or 200x100 px, and use the auto-crop excess whitespace feature to produce a clean signature.'
              }
            },
            {
              '@type': 'Question',
              'name': 'Are my uploaded photos stored on a server?',
              'acceptedAnswer': {
                '@type': 'Answer',
                'text': 'No. All image processing takes place 100% locally in your web browser using HTML5 Canvas technology. No files or signatures are ever sent to or stored on our servers.'
              }
            }
          ]
        }
      ]
    });
    document.head.appendChild(scriptTag);

    return () => {
      document.title = originalTitle;
      if (metaDesc && prevDesc) metaDesc.setAttribute('content', prevDesc);
      const existingScript = document.getElementById('photo-resizer-schema');
      if (existingScript) existingScript.remove();
    };
  }, []);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
      if (prevResultUrlRef.current) URL.revokeObjectURL(prevResultUrlRef.current);
    };
  }, [originalPreviewUrl]);

  // When mode changes (Photo <-> Signature), update default dimensions & presets
  const handleModeChange = (newMode: 'photo' | 'signature') => {
    setMode(newMode);
    if (newMode === 'signature') {
      setTargetWidth(140);
      setTargetHeight(60);
      setAspectRatioValue(140 / 60);
      setTargetKb(20);
      setCustomKbInput('20');
      setSelectedPresetId('sig-140-60');
      setBackgroundColor('#FFFFFF');
      setOutputFormat('image/jpeg');
    } else {
      setTargetWidth(200);
      setTargetHeight(230);
      setAspectRatioValue(200 / 230);
      setTargetKb(50);
      setCustomKbInput('50');
      setSelectedPresetId('exam-standard');
      setBackgroundColor('#FFFFFF');
      setOutputFormat('image/jpeg');
    }
  };

  // Handle Preset Selection
  const applyPreset = (preset: PresetItem) => {
    setSelectedPresetId(preset.id);
    setTargetWidth(preset.width);
    setTargetHeight(preset.height);
    setAspectRatioValue(preset.width / preset.height);
    setOutputFormat(preset.format);
    if (preset.targetKb) {
      setTargetKb(preset.targetKb);
      setCustomKbInput(preset.targetKb.toString());
      setIsCustomKb(false);
    }
  };

  // File loading and validation
  const handleFileSelect = (file: File) => {
    setErrorMessage(null);

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase()) && !file.name.match(/\.(jpg|jpeg|png|webp)$/i)) {
      setErrorMessage('Please select a valid image file (JPG, JPEG, PNG, or WebP).');
      return;
    }

    // Validate size (max 25MB safety limit)
    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('The selected image is larger than 25MB. Please choose a smaller image.');
      return;
    }

    // Revoke previous original url if any
    if (originalPreviewUrl) {
      URL.revokeObjectURL(originalPreviewUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      setImageFile(file);
      setImageElement(img);
      setOriginalPreviewUrl(objectUrl);
      setMetadata({
        width: img.naturalWidth,
        height: img.naturalHeight,
        format: file.type.replace('image/', '').toUpperCase() || 'JPEG',
        sizeBytes: file.size,
        fileName: file.name,
        aspectRatio: img.naturalWidth / img.naturalHeight,
      });

      // If user hadn't selected custom dimensions, keep presets or update aspect ratio
      if (maintainAspectRatio) {
        setTargetHeight(Math.round(targetWidth / (img.naturalWidth / img.naturalHeight)));
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setErrorMessage('Failed to load image. The file might be corrupted or in an unsupported format.');
    };

    img.src = objectUrl;
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Dimension Change Handlers
  const handleWidthChange = (val: number) => {
    const w = Math.max(1, val);
    setTargetWidth(w);
    setSelectedPresetId('custom');
    if (maintainAspectRatio && aspectRatioValue) {
      setTargetHeight(Math.max(1, Math.round(w / aspectRatioValue)));
    }
  };

  const handleHeightChange = (val: number) => {
    const h = Math.max(1, val);
    setTargetHeight(h);
    setSelectedPresetId('custom');
    if (maintainAspectRatio && aspectRatioValue) {
      setTargetWidth(Math.max(1, Math.round(h * aspectRatioValue)));
    }
  };

  const toggleAspectRatioLock = () => {
    const nextState = !maintainAspectRatio;
    setMaintainAspectRatio(nextState);
    if (nextState) {
      // Lock current ratio
      setAspectRatioValue(targetWidth / targetHeight);
    }
  };

  // Re-run image processing whenever parameters change
  useEffect(() => {
    if (!imageElement || !metadata) return;

    let isCurrent = true;
    setIsProcessing(true);

    const runProcessing = async () => {
      try {
        const options: ResizeOptions = {
          targetWidth,
          targetHeight,
          maintainAspectRatio,
          fitMode,
          backgroundColor,
          targetKb,
          outputFormat,
          quality,
          rotation,
          trimSignatureBorders: mode === 'signature' && trimBorders,
          enhanceSignatureContrast: mode === 'signature' && enhanceContrast,
          autoScaleIfOverTargetKb,
        };

        const result = await processImage(imageElement, options, metadata.sizeBytes);

        if (!isCurrent) {
          URL.revokeObjectURL(result.dataUrl);
          return;
        }

        // Clean up previous result URL
        if (prevResultUrlRef.current) {
          URL.revokeObjectURL(prevResultUrlRef.current);
        }
        prevResultUrlRef.current = result.dataUrl;

        setProcessResult(result);
        setIsProcessing(false);
      } catch (err) {
        if (isCurrent) {
          console.error('Image processing failed:', err);
          setIsProcessing(false);
        }
      }
    };

    const timer = setTimeout(runProcessing, 80);
    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [
    imageElement,
    metadata,
    targetWidth,
    targetHeight,
    maintainAspectRatio,
    fitMode,
    backgroundColor,
    targetKb,
    outputFormat,
    quality,
    rotation,
    trimBorders,
    enhanceContrast,
    autoScaleIfOverTargetKb,
    mode,
  ]);

  // Handle Download
  const handleDownload = () => {
    if (!processResult) return;

    const baseName = metadata?.fileName.replace(/\.[^/.]+$/, '') || 'aton-resized';
    const ext =
      processResult.outputFormat === 'image/png'
        ? 'png'
        : processResult.outputFormat === 'image/webp'
        ? 'webp'
        : 'jpg';
    const kbStr = `${Math.round(processResult.outputSizeBytes / 1024)}kb`;
    const finalFileName = `${mode}-${baseName}-${processResult.outputWidth}x${processResult.outputHeight}-${kbStr}.${ext}`;

    const link = document.createElement('a');
    link.href = processResult.dataUrl;
    link.download = finalFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset image
  const handleReset = () => {
    if (originalPreviewUrl) URL.revokeObjectURL(originalPreviewUrl);
    if (prevResultUrlRef.current) URL.revokeObjectURL(prevResultUrlRef.current);
    setImageFile(null);
    setImageElement(null);
    setMetadata(null);
    setOriginalPreviewUrl(null);
    setProcessResult(null);
    setRotation(0);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const currentPresets = mode === 'photo' ? PHOTO_PRESETS : SIGNATURE_PRESETS;

  // FAQ Items
  const faqList = [
    {
      q: 'How can I resize a photo online?',
      a: 'Simply upload your photo using the drag-and-drop box above, choose your target width and height in pixels (or select one of our pre-configured exam presets), set your target file size in KB if your application specifies one, and click "Download Photo". All processing takes place instantly in your browser.',
    },
    {
      q: 'How can I compress a photo to 20 KB or 50 KB?',
      a: 'Click on the "20 KB" or "50 KB" preset in the Target File Size section. Our client-side optimization engine tests quality steps using binary search to bring the file under your required limit while preserving visual fidelity. For strict 10 KB or 20 KB limits, ensure "Auto-scale dimensions if needed" is turned on.',
    },
    {
      q: 'Can I resize my signature to a specific size?',
      a: 'Yes! Select the "Signature Resizer" tab. You can set dimensions like 140 × 60 px or 200 × 100 px. We also provide smart features like "Auto-trim excess blank borders" and "Clean white background" to make handwritten signatures on paper look crisp, clear, and professional.',
    },
    {
      q: 'Which image formats are supported?',
      a: 'You can upload JPG, JPEG, PNG, and WebP files. You can export your processed image as JPEG (best for government forms and smaller file sizes), PNG (best for signatures with transparent backgrounds), or WebP (for modern web portals).',
    },
    {
      q: 'Can I resize a photo without losing quality?',
      a: 'Yes. Our tool uses bicubic canvas interpolation with high smoothing quality. However, note that if you request a very small file size (such as 10 KB or 20 KB), compression algorithms must reduce redundant image data or scale dimensions slightly to meet strict limit guidelines.',
    },
    {
      q: 'Is this photo & signature resizer free?',
      a: 'Yes, 100% free with unlimited usages. There are no watermarks, no registration or signup required, and no hidden fees.',
    },
    {
      q: 'Are my uploaded photos or signatures stored on a server?',
      a: 'No. We take privacy extremely seriously. All image manipulation and compression executes locally on your device within your web browser using HTML5 Canvas. Your sensitive passport photos and signatures are never uploaded, sent, or saved to any server.',
    },
    {
      q: 'How do I find the correct photo dimensions for an exam form?',
      a: 'Always refer to the official notification bulletin or recruitment advertisement for your specific exam or job portal. Most portals clearly state the required pixel dimensions (e.g., 200 × 230 px for photos, 140 × 60 px for signatures) and file size bounds (e.g., 20 KB to 50 KB). You can enter those exact numbers in our Custom Dimensions fields.',
    },
  ];

  return (
    <div className="w-full">
      {/* 1. Breadcrumb navigation */}
      <div className="bg-gray-50 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-800 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <button
              onClick={() => onNavigateHome?.('home')}
              className="hover:text-vibrantOrange font-medium transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <button
              onClick={() => onNavigateHome?.('services')}
              className="hover:text-vibrantOrange font-medium transition-colors"
            >
              Tools
            </button>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-semibold">
              Photo & Signature Resizer
            </span>
          </nav>
        </div>
      </div>

      {/* 2. Hero Header */}
      <section className="pt-10 pb-8 sm:pt-14 sm:pb-10 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-darkBg border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-royalBlue/20 text-royalBlue dark:text-blue-300 text-xs sm:text-sm font-semibold mb-4 border border-blue-100 dark:border-blue-800">
            <Sparkles size={16} className="text-vibrantOrange animate-pulse" />
            Fast, Free & 100% Client-Side Privacy
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-gray-900 dark:text-white mb-4">
            Free Photo & Signature Resizer Online
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Resize photos and signatures to exact pixel dimensions (width × height) and compress to
            target file sizes (20 KB, 50 KB, 100 KB) for job applications, competitive exams, passport forms, and visas.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-6 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <Shield size={16} className="text-green-500" /> No Server Upload (100% Private)
            </span>
            <span className="flex items-center gap-1.5">
              <FileCheck size={16} className="text-royalBlue" /> Exact KB Target Compression
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles size={16} className="text-vibrantOrange" /> No Watermarks or Sign-up
            </span>
          </div>
        </div>
      </section>

      {/* AdSense Placement 1: Top Banner (Non-intrusive) */}
      <AdSenseUnit
        placementLabel="Top Banner (Header)"
        minHeight="min-h-[90px] sm:min-h-[100px]"
      />

      {/* 3. Main Tool Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
          {/* Mode Switcher Header Tabs */}
          <div className="flex border-b border-gray-200 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-950/40 p-2 sm:p-3 gap-2">
            <button
              onClick={() => handleModeChange('photo')}
              className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl font-bold text-sm sm:text-base transition-all ${
                mode === 'photo'
                  ? 'bg-white dark:bg-slate-800 text-royalBlue dark:text-white shadow-md border border-gray-200 dark:border-slate-700'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50'
              }`}
            >
              <ImageIcon size={20} className={mode === 'photo' ? 'text-royalBlue' : ''} />
              <span>Photo Resizer</span>
              <span className="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-royalBlue dark:text-blue-300">
                Passport & Exam Photos
              </span>
            </button>

            <button
              onClick={() => handleModeChange('signature')}
              className={`flex-1 flex items-center justify-center gap-2.5 py-3 px-4 rounded-2xl font-bold text-sm sm:text-base transition-all ${
                mode === 'signature'
                  ? 'bg-white dark:bg-slate-800 text-vibrantOrange dark:text-white shadow-md border border-gray-200 dark:border-slate-700'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50'
              }`}
            >
              <PenTool size={20} className={mode === 'signature' ? 'text-vibrantOrange' : ''} />
              <span>Signature Resizer</span>
              <span className="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/50 text-vibrantOrange dark:text-orange-300">
                Ink & Transparent Signatures
              </span>
            </button>
          </div>

          {/* Tool Body Grid */}
          <div className="p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Upload & Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Upload Box */}
              {!imageFile ? (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative cursor-pointer border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all ${
                    isDragging
                      ? 'border-royalBlue bg-blue-50/50 dark:bg-blue-950/20 scale-[0.99]'
                      : 'border-gray-300 dark:border-slate-700 hover:border-royalBlue dark:hover:border-royalBlue bg-gray-50/50 dark:bg-slate-950/30'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    id={fileInputId}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />

                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-blue-100 dark:bg-slate-800 text-royalBlue dark:text-blue-400 flex items-center justify-center shadow-inner">
                    <Upload size={32} />
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {mode === 'photo' ? 'Upload Photo' : 'Upload Signature'}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
                    Drag and drop your file here, or click to browse from your device
                  </p>

                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-gradient text-white text-xs sm:text-sm font-bold shadow-md hover:scale-105 transition-all">
                    Choose Image File
                  </div>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                    <span>Supports JPG, JPEG, PNG, WebP</span>
                    <span>•</span>
                    <span>Max size: 25 MB</span>
                  </div>
                </div>
              ) : (
                /* Selected File Header Bar */
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {originalPreviewUrl && (
                        <img
                          src={originalPreviewUrl}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[200px] sm:max-w-xs">
                        {metadata?.fileName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {metadata?.width} × {metadata?.height} px • {formatFileSize(metadata?.sizeBytes || 0)} • {metadata?.format}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      ref={fileInputRef}
                      id={fileInputId}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFileSelect(e.target.files[0]);
                        }
                      }}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                      title="Replace with another file"
                    >
                      Change
                    </button>
                    <button
                      onClick={handleReset}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      title="Remove image"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm flex items-start gap-3">
                  <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Error with selected file</p>
                    <p className="text-xs mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Presets Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Sliders size={14} className="text-royalBlue" />
                    Recommended {mode === 'photo' ? 'Photo' : 'Signature'} Presets
                  </label>
                  <span className="text-[11px] text-gray-400 dark:text-gray-500">
                    (Customizable general examples)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className={`text-left p-3 rounded-2xl border text-xs transition-all ${
                        selectedPresetId === preset.id
                          ? 'border-royalBlue bg-blue-50/70 dark:bg-blue-950/40 text-royalBlue dark:text-blue-300 shadow-sm font-semibold'
                          : 'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="font-bold text-gray-900 dark:text-white flex items-center justify-between">
                        <span>{preset.name}</span>
                        {selectedPresetId === preset.id && <CheckCircle2 size={14} className="text-royalBlue" />}
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                        {preset.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Exact Dimension Inputs */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/80 dark:bg-slate-950/40 border border-gray-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Crop size={14} className="text-vibrantOrange" />
                    Resize Dimensions (Pixels)
                  </h4>
                  <button
                    onClick={toggleAspectRatioLock}
                    className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                      maintainAspectRatio
                        ? 'bg-blue-100 text-royalBlue dark:bg-blue-900/50 dark:text-blue-300'
                        : 'bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-400'
                    }`}
                    title="Lock or unlock aspect ratio"
                  >
                    {maintainAspectRatio ? <Lock size={12} /> : <Unlock size={12} />}
                    {maintainAspectRatio ? 'Aspect Ratio Locked' : 'Ratio Unlocked'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={8000}
                      value={targetWidth}
                      onChange={(e) => handleWidthChange(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-royalBlue"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      min={10}
                      max={8000}
                      value={targetHeight}
                      onChange={(e) => handleHeightChange(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-royalBlue"
                    />
                  </div>
                </div>

                {/* Fit Mode and Fill Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Fit & Crop Style
                    </label>
                    <select
                      value={fitMode}
                      onChange={(e) => setFitMode(e.target.value as 'fit' | 'cover' | 'fill')}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-royalBlue"
                    >
                      <option value="fit">Fit / Contain (Add background padding)</option>
                      <option value="cover">Cover / Center Crop (Fill box without distortion)</option>
                      <option value="fill">Fill / Stretch (Force exact proportions)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Background Fill
                    </label>
                    <select
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-royalBlue"
                    >
                      <option value="#FFFFFF">Solid White (Standard for Forms)</option>
                      <option value="transparent">Transparent (PNG signatures)</option>
                      <option value="#F3F4F6">Off-White / Light Gray</option>
                      <option value="#000000">Black</option>
                    </select>
                  </div>
                </div>

                {/* Rotation buttons */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Orientation:</span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setRotation((prev) => (prev + 90) % 360)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-slate-700 transition-colors font-medium"
                    >
                      <RotateCw size={13} /> Rotate 90° ({rotation}°)
                    </button>
                    {rotation !== 0 && (
                      <button
                        onClick={() => setRotation(0)}
                        className="px-2 py-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Signature specific smart filters */}
                {mode === 'signature' && (
                  <div className="pt-3 border-t border-gray-200 dark:border-slate-800 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={trimBorders}
                        onChange={(e) => setTrimBorders(e.target.checked)}
                        className="rounded text-vibrantOrange focus:ring-vibrantOrange"
                      />
                      <span>Auto-crop excess blank margins around signature</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={enhanceContrast}
                        onChange={(e) => setEnhanceContrast(e.target.checked)}
                        className="rounded text-vibrantOrange focus:ring-vibrantOrange"
                      />
                      <span>Enhance contrast (Clean paper shadows to crisp white)</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Compression & Target File Size (Essential Feature) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/80 dark:bg-slate-950/40 border border-gray-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-green-500" />
                    Target File Size (Compress to KB)
                  </h4>
                  <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    Iterative compression
                  </span>
                </div>

                {/* KB quick pills */}
                <div className="flex flex-wrap gap-2">
                  {TARGET_KB_OPTIONS.map((kb) => (
                    <button
                      key={kb}
                      onClick={() => {
                        setTargetKb(kb);
                        setCustomKbInput(kb.toString());
                        setIsCustomKb(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        targetKb === kb && !isCustomKb
                          ? 'bg-green-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-green-500'
                      }`}
                    >
                      Under {kb} KB
                    </button>
                  ))}

                  <button
                    onClick={() => {
                      setIsCustomKb(true);
                      setTargetKb(Number(customKbInput) || 50);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isCustomKb
                        ? 'bg-royalBlue text-white shadow-sm'
                        : 'bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:border-royalBlue'
                    }`}
                  >
                    Custom KB
                  </button>

                  <button
                    onClick={() => {
                      setTargetKb(null);
                      setIsCustomKb(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      targetKb === null
                        ? 'bg-gray-800 text-white dark:bg-slate-700'
                        : 'bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    No Limit (High Quality)
                  </button>
                </div>

                {/* Custom KB Input if selected */}
                {isCustomKb && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Maximum Allowed Size:
                    </span>
                    <div className="relative w-36">
                      <input
                        type="number"
                        min={5}
                        max={5000}
                        value={customKbInput}
                        onChange={(e) => {
                          setCustomKbInput(e.target.value);
                          const val = Number(e.target.value);
                          if (val > 0) setTargetKb(val);
                        }}
                        className="w-full px-3 py-1.5 pr-8 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white font-bold text-xs"
                      />
                      <span className="absolute right-2.5 top-1.5 text-xs text-gray-400 font-bold">
                        KB
                      </span>
                    </div>
                  </div>
                )}

                {/* Auto scale toggle */}
                <div className="space-y-2 pt-2 border-t border-gray-200 dark:border-slate-800">
                  <label className="flex items-start gap-2 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={autoScaleIfOverTargetKb}
                      onChange={(e) => setAutoScaleIfOverTargetKb(e.target.checked)}
                      className="mt-0.5 rounded text-royalBlue focus:ring-royalBlue"
                    />
                    <div>
                      <span className="font-semibold">Auto-scale dimensions if needed to meet strict target KB</span>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">
                        When an image is too complex or large to squeeze into a tiny target (e.g., 10 KB or 20 KB), this softly scales down dimensions so the file complies with your form limit.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Format selection */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Output Format
                    </label>
                    <select
                      value={outputFormat}
                      onChange={(e) => setOutputFormat(e.target.value as 'image/jpeg' | 'image/png' | 'image/webp')}
                      className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-royalBlue"
                    >
                      <option value="image/jpeg">JPEG (.jpg) — Recommended for forms</option>
                      <option value="image/png">PNG (.png) — Preserves transparency</option>
                      <option value="image/webp">WebP (.webp) — Modern web</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Base Quality ({Math.round(quality * 100)}%)
                    </label>
                    <input
                      type="range"
                      min={0.1}
                      max={1.0}
                      step={0.05}
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      className="w-full accent-royalBlue mt-2"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-gray-500 dark:text-gray-400 bg-blue-50/50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-blue-100/80 dark:border-slate-800 flex items-start gap-2">
                  <Info size={14} className="text-royalBlue flex-shrink-0 mt-0.5" />
                  <p>
                    Note: Exact file size depends on image complexity, colors, format, and dimensions. If the target size cannot be reached without severe distortion, the tool produces the closest safe result.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Previews, Comparison & Download */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              <div className="bg-gray-50/90 dark:bg-slate-950/60 rounded-3xl p-5 border border-gray-200 dark:border-slate-800 flex-1 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                    Live Output Preview
                  </h4>
                  {processResult && (
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        processResult.achievedTargetKb
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                      }`}
                    >
                      {processResult.achievedTargetKb ? 'Target Met' : 'Closest Result'}
                    </span>
                  )}
                </div>

                {/* Preview Tabs (Comparison vs Single) */}
                <div className="flex gap-2 my-3">
                  <button
                    onClick={() => setActivePreviewTab('comparison')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      activePreviewTab === 'comparison'
                        ? 'bg-white dark:bg-slate-800 shadow-sm text-gray-900 dark:text-white'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Comparison
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('processed')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      activePreviewTab === 'processed'
                        ? 'bg-white dark:bg-slate-800 shadow-sm text-gray-900 dark:text-white'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Output Only
                  </button>
                  <button
                    onClick={() => setActivePreviewTab('original')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                      activePreviewTab === 'original'
                        ? 'bg-white dark:bg-slate-800 shadow-sm text-gray-900 dark:text-white'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    Original Only
                  </button>
                </div>

                {/* Image Display Area */}
                <div className="flex-1 min-h-[260px] flex items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 relative overflow-hidden">
                  {!imageFile ? (
                    <div className="text-center text-gray-400 dark:text-gray-500 p-6">
                      <ImageIcon size={44} className="mx-auto mb-2 opacity-40" />
                      <p className="text-sm font-medium">No image loaded yet</p>
                      <p className="text-xs opacity-75">Upload a photo or signature to see live results</p>
                    </div>
                  ) : isProcessing ? (
                    <div className="flex flex-col items-center justify-center p-6 text-royalBlue">
                      <RefreshCw size={32} className="animate-spin mb-2" />
                      <span className="text-xs font-semibold">Optimizing and resizing...</span>
                    </div>
                  ) : activePreviewTab === 'comparison' && originalPreviewUrl && processResult ? (
                    <div className="grid grid-cols-2 gap-3 w-full h-full items-center">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                          Original
                        </span>
                        <div className="max-h-[220px] max-w-full rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-1">
                          <img
                            src={originalPreviewUrl}
                            alt="Original"
                            className="max-h-[200px] max-w-full object-contain"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-royalBlue dark:text-blue-400 mb-1">
                          Processed
                        </span>
                        <div className="max-h-[220px] max-w-full rounded-lg overflow-hidden border-2 border-royalBlue bg-gray-50 dark:bg-slate-950 flex items-center justify-center p-1">
                          <img
                            src={processResult.dataUrl}
                            alt="Processed Result"
                            className="max-h-[200px] max-w-full object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  ) : activePreviewTab === 'original' && originalPreviewUrl ? (
                    <div className="flex items-center justify-center w-full h-full p-2">
                      <img
                        src={originalPreviewUrl}
                        alt="Original"
                        className="max-h-[260px] max-w-full object-contain rounded-lg"
                      />
                    </div>
                  ) : processResult ? (
                    <div className="flex items-center justify-center w-full h-full p-2">
                      <img
                        src={processResult.dataUrl}
                        alt="Processed Result"
                        className="max-h-[260px] max-w-full object-contain rounded-lg"
                      />
                    </div>
                  ) : null}
                </div>

                {/* Metrics Table */}
                {processResult && metadata && (
                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-slate-800 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-300">
                      <div>
                        <span className="text-gray-400 text-[11px] block">Original Dimensions</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {metadata.width} × {metadata.height} px
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[11px] block">Output Dimensions</span>
                        <span className="font-semibold text-royalBlue dark:text-blue-400">
                          {processResult.outputWidth} × {processResult.outputHeight} px
                          {processResult.dimensionsScaled && ' (auto-scaled)'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-gray-600 dark:text-gray-300">
                      <div>
                        <span className="text-gray-400 text-[11px] block">Original File Size</span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {formatFileSize(metadata.sizeBytes)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 text-[11px] block">Output File Size</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          {formatFileSize(processResult.outputSizeBytes)}
                          {processResult.compressionRatio > 0 && (
                            <span className="ml-1 text-[11px] font-bold text-green-600 dark:text-green-400">
                              (-{processResult.compressionRatio}%)
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-gray-400">
                      <span>Format: {outputFormat.replace('image/', '').toUpperCase()}</span>
                      <span>Quality: {Math.round(processResult.actualQualityUsed * 100)}%</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-5 space-y-2.5">
                  <button
                    onClick={handleDownload}
                    disabled={!processResult}
                    className="w-full py-3.5 px-4 rounded-2xl bg-orange-gradient text-white font-extrabold text-sm uppercase tracking-wider shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    {mode === 'photo' ? 'Download Resized Photo' : 'Download Resized Signature'}
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-2.5 px-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-200 font-semibold text-xs hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Upload size={14} /> Process Another
                    </button>
                    <button
                      onClick={handleReset}
                      className="py-2.5 px-3 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-500 hover:text-red-500 font-semibold text-xs transition-colors"
                      title="Reset all settings and clear image"
                    >
                      <RefreshCw size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AdSense Placement 2: Mid-Content (Between Tool and Step-by-Step Guide) */}
      <AdSenseUnit
        placementLabel="Mid-Content Banner"
        minHeight="min-h-[100px] sm:min-h-[120px]"
      />

      {/* 4. Step-by-Step Educational Guide */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-slate-900/50 border-t border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black font-display text-gray-900 dark:text-white mb-3">
              How to Resize & Compress Photo or Signature Online
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
              Follow these simple steps to prepare your images according to official application form guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-vibrantOrange font-black flex items-center justify-center mb-4 text-lg">
                1
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                Upload Image
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Choose between Photo Resizer and Signature Resizer mode. Drag and drop your file or pick from your device in JPG, PNG, or WebP.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-royalBlue font-black flex items-center justify-center mb-4 text-lg">
                2
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                Set Dimensions
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Enter your required pixel width & height (e.g. 200 × 230 px or 140 × 60 px) or choose from standard pre-calculated presets.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-950/60 text-green-600 font-black flex items-center justify-center mb-4 text-lg">
                3
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                Select Target KB
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Click 20 KB, 50 KB, 100 KB, or enter custom KB. The engine iteratively adjusts compression to stay within the limit.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm relative">
              <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 font-black flex items-center justify-center mb-4 text-lg">
                4
              </div>
              <h3 className="font-bold text-base text-gray-900 dark:text-white mb-2">
                Preview & Download
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Inspect before & after side-by-side previews, verify output dimensions and KB size, and download your processed image instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Common Dimension Reference Table (General Guidance Only) */}
      <section className="py-12 sm:py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-black font-display text-gray-900 dark:text-white mb-3">
            Common Application Form Specifications Reference
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            Below are general examples frequently requested across public and private recruitment portals. Always verify with your official notification bulletin.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Exam / Form Category</th>
                <th className="py-3 px-4">Typical Photo Size</th>
                <th className="py-3 px-4">Typical Signature Size</th>
                <th className="py-3 px-4">Standard File Size Range</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800 text-gray-700 dark:text-gray-300">
              <tr className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Banking & Financial Recruitment (IBPS, SBI, RBI)</td>
                <td className="py-3 px-4">200 × 230 pixels</td>
                <td className="py-3 px-4">140 × 60 pixels</td>
                <td className="py-3 px-4">Photo: 20–50 KB | Signature: 10–20 KB</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Staff Selection & National Boards (SSC, UPSC)</td>
                <td className="py-3 px-4">3.5 × 4.5 cm (~413 × 531 px)</td>
                <td className="py-3 px-4">200 × 60 to 140 × 60 pixels</td>
                <td className="py-3 px-4">Photo: 20–50 KB | Signature: 10–20 KB</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">University Admissions & Entrance Tests (NTA / CUET)</td>
                <td className="py-3 px-4">200 × 230 to 300 × 300 pixels</td>
                <td className="py-3 px-4">200 × 100 pixels</td>
                <td className="py-3 px-4">Photo: 10–200 KB | Signature: 4–30 KB</td>
              </tr>
              <tr className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Passport & Visa Applications</td>
                <td className="py-3 px-4">2 × 2 inches (600 × 600 px) or 35 × 45 mm</td>
                <td className="py-3 px-4">Varies by issuing authority</td>
                <td className="py-3 px-4">Up to 240 KB (JPEG)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5">
          <Info size={16} className="flex-shrink-0 mt-0.5" />
          <p>
            <strong>Disclaimer:</strong> The dimensions listed above are illustrative examples. Because application guidelines vary by region, agency, and year, we recommend consulting your official notification and entering those exact values using the "Custom Dimensions" inputs above.
          </p>
        </div>
      </section>

      {/* 6. Privacy & In-Browser Processing Commitment */}
      <section className="py-12 bg-gray-50 dark:bg-slate-900/60 border-t border-b border-gray-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-green-100 dark:bg-green-950/60 text-green-600 flex items-center justify-center mb-4">
            <Shield size={24} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-gray-900 dark:text-white mb-3">
            Zero Server Uploads: 100% Client-Side Privacy
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed mb-6">
            Unlike many online converters that upload your personal photographs and signatures to external servers, ATON TECH Solutions processes everything directly inside your browser using HTML5 Canvas. Your sensitive identity documents never leave your computer or phone.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 flex items-start gap-3">
              <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">No Cloud Storage</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">Images are never stored, logged, or indexed.</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 flex items-start gap-3">
              <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">Offline Capable</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">Runs locally even on slow or interrupted connections.</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 flex items-start gap-3">
              <CheckCircle2 size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-gray-900 dark:text-white block">Memory Cleared</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">All temporary object URLs are revoked immediately.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Frequently Asked Questions Accordion */}
      <section className="py-12 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black font-display text-gray-900 dark:text-white mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
            Answers to common questions regarding photo and signature resizing, compression, and application guidelines.
          </p>
        </div>

        <div className="space-y-3">
          {faqList.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-gray-900 dark:text-white hover:text-royalBlue transition-colors"
                >
                  <span>{item.q}</span>
                  <div className="p-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 flex-shrink-0">
                    {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-slate-800/60 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Suggested Tools Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <SuggestedTools
          currentToolId="photo-signature-resizer"
          onNavigateToTool={(path) => onNavigateToTool ? onNavigateToTool(path) : (window.location.href = path)}
        />
      </div>

      {/* 8. Related Tools and Consultation Call to Action */}
      <section className="py-12 sm:py-16 bg-blue-gradient text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 font-display">
            Need Custom Enterprise Software or Automation Tools?
          </h2>
          <p className="text-sm sm:text-base opacity-90 mb-8 max-w-2xl mx-auto">
            ATON TECH Solutions builds cutting-edge enterprise web applications, e-commerce platforms, AI systems, and automated digital workflows tailored to your business needs.
          </p>
          <button
            onClick={() => onNavigateHome?.('contact-us')}
            className="inline-block px-8 py-3.5 rounded-full bg-orange-gradient text-white font-bold text-sm sm:text-base hover:shadow-xl hover:scale-105 transition-all"
          >
            Get Free Consultation
          </button>
        </div>
      </section>

      {/* AdSense Placement 3: Bottom Placement */}
      <AdSenseUnit
        placementLabel="Bottom Placement (Footer Area)"
        minHeight="min-h-[90px] sm:min-h-[100px]"
      />
    </div>
  );
};

export default PhotoSignatureResizer;
