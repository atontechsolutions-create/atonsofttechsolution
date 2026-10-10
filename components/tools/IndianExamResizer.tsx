import React, { useState, useRef, useEffect } from 'react';
import {
  FileCheck,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Sliders,
  CheckCircle2,
  HelpCircle,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';
import { processImage } from './imageProcessing';

interface ExamRule {
  id: string;
  name: string;
  category: string;
  photoDims: { w: number; h: number; minKb: number; maxKb: number };
  sigDims: { w: number; h: number; minKb: number; maxKb: number };
  notes: string;
}

const EXAM_RULES: ExamRule[] = [
  {
    id: 'ssc',
    name: 'SSC (CGL, CHSL, MTS, GD)',
    category: 'Central Govt',
    photoDims: { w: 200, h: 230, minKb: 20, maxKb: 50 },
    sigDims: { w: 140, h: 60, minKb: 10, maxKb: 20 },
    notes: 'Recent colored photograph with plain light or white background. Crisp black/blue ink signature.',
  },
  {
    id: 'upsc',
    name: 'UPSC (Civil Services, NDA, CDS)',
    category: 'Union Commission',
    photoDims: { w: 350, h: 350, minKb: 20, maxKb: 300 },
    sigDims: { w: 350, h: 350, minKb: 20, maxKb: 300 },
    notes: 'Photo must show 3/4 face visible. Must not be older than 10 days from portal application start date.',
  },
  {
    id: 'ibps',
    name: 'IBPS / SBI (PO, Clerk, SO)',
    category: 'Banking',
    photoDims: { w: 200, h: 230, minKb: 20, maxKb: 50 },
    sigDims: { w: 140, h: 60, minKb: 10, maxKb: 20 },
    notes: 'Signature in capital/block letters will NOT be accepted. White paper with black ink pen.',
  },
  {
    id: 'rrb',
    name: 'RRB Railway Recruitment (NTPC, Group D)',
    category: 'Railways',
    photoDims: { w: 200, h: 230, minKb: 20, maxKb: 50 },
    sigDims: { w: 140, h: 60, minKb: 10, maxKb: 40 },
    notes: 'Clear color photo with plain white background. Strictly without goggles or caps.',
  },
  {
    id: 'nta-neet-jee',
    name: 'NTA (NEET-UG, JEE Main, CUET)',
    category: 'National Entrance',
    photoDims: { w: 200, h: 230, minKb: 10, maxKb: 200 },
    sigDims: { w: 140, h: 60, minKb: 4, maxKb: 30 },
    notes: '80% face coverage without mask. White background. Signature in running handwriting.',
  },
  {
    id: 'state-psc',
    name: 'State PSC / Police Recruitment',
    category: 'State Govt',
    photoDims: { w: 200, h: 230, minKb: 20, maxKb: 50 },
    sigDims: { w: 140, h: 60, minKb: 10, maxKb: 20 },
    notes: 'Standard 3.5cm x 4.5cm proportions for state administrative and police commission exams.',
  },
];

interface IndianExamResizerProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const IndianExamResizer: React.FC<IndianExamResizerProps> = ({
  onNavigateHome,
  onNavigateToTool,
}) => {
  const [activeTab, setActiveTab] = useState<'photo' | 'signature'>('photo');
  const [selectedExam, setSelectedExam] = useState<ExamRule>(EXAM_RULES[0]);

  // Image states
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [originalDims, setOriginalDims] = useState<{ w: number; h: number } | null>(null);

  // Processed states
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedDims, setProcessedDims] = useState<{ w: number; h: number } | null>(null);
  const [processedSizeKb, setProcessedSizeKb] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Custom overrides
  const [customWidth, setCustomWidth] = useState<number>(EXAM_RULES[0].photoDims.w);
  const [customHeight, setCustomHeight] = useState<number>(EXAM_RULES[0].photoDims.h);
  const [targetMaxKb, setTargetMaxKb] = useState<number>(EXAM_RULES[0].photoDims.maxKb);
  const [addNameDateBar, setAddNameDateBar] = useState<boolean>(false);
  const [candidateName, setCandidateName] = useState<string>('');
  const [photoDate, setPhotoDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync exam preset with dimensions
  useEffect(() => {
    const config = activeTab === 'photo' ? selectedExam.photoDims : selectedExam.sigDims;
    setCustomWidth(config.w);
    setCustomHeight(config.h);
    setTargetMaxKb(config.maxKb);
  }, [selectedExam, activeTab]);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose a valid JPG or PNG image');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      setOriginalPreview(src);
      setOriginalFile(file);

      const img = new Image();
      img.src = src;
      img.onload = () => {
        setOriginalDims({ w: img.width, h: img.height });
        processExamImage(file, img);
      };
    };
    reader.readAsDataURL(file);
  };

  const processExamImage = async (file: File, loadedImg?: HTMLImageElement) => {
    setIsProcessing(true);
    try {
      const img = loadedImg || await (async () => {
        return new Promise<HTMLImageElement>((resolve) => {
          const i = new Image();
          i.src = originalPreview!;
          i.onload = () => resolve(i);
        });
      })();

      const canvas = document.createElement('canvas');
      canvas.width = customWidth;
      canvas.height = customHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Fill crisp white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (activeTab === 'signature') {
        // High contrast signature paper cleaning
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d')!;

        // Fit signature inside canvas retaining aspect ratio
        const scale = Math.min((canvas.width - 20) / img.width, (canvas.height - 10) / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;

        tempCtx.fillStyle = '#FFFFFF';
        tempCtx.fillRect(0, 0, canvas.width, canvas.height);
        tempCtx.drawImage(img, x, y, w, h);

        const imgData = tempCtx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        // Clean off-white paper and darken ink
        for (let i = 0; i < data.length; i += 4) {
          const brightness = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114);
          if (brightness > 195) {
            data[i] = 255;
            data[i + 1] = 255;
            data[i + 2] = 255;
          } else {
            // Darken ink
            data[i] = Math.max(0, data[i] * 0.7);
            data[i + 1] = Math.max(0, data[i + 1] * 0.7);
            data[i + 2] = Math.max(0, data[i + 2] * 0.7);
          }
        }
        ctx.putImageData(imgData, 0, 0);
      } else {
        // Draw photo cropped to canvas
        let drawH = canvas.height;
        if (addNameDateBar) {
          drawH = canvas.height - 44; // leave bottom bar for name & date
        }
        const imgAspect = img.width / img.height;
        const targetAspect = canvas.width / drawH;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;

        if (imgAspect > targetAspect) {
          sw = img.height * targetAspect;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / targetAspect;
          sy = (img.height - sh) / 2;
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, drawH);

        // Add Name and Date of Photo bar (mandatory for SSC / UPSC when requested)
        if (addNameDateBar) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, drawH, canvas.width, 44);
          ctx.strokeStyle = '#D1D5DB';
          ctx.lineWidth = 1;
          ctx.strokeRect(0, drawH, canvas.width, 44);

          ctx.fillStyle = '#111827';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(candidateName.toUpperCase() || 'CANDIDATE NAME', canvas.width / 2, drawH + 16);
          ctx.font = '10px sans-serif';
          ctx.fillStyle = '#4B5563';
          ctx.fillText(`DOP: ${photoDate || 'DD-MM-YYYY'}`, canvas.width / 2, drawH + 34);
        }
      }

      // Convert to blob and compress to target max KB
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const processedFile = new File([blob], `${activeTab}.jpg`, { type: 'image/jpeg' });
        const result = await processImage(processedFile, {
          targetWidth: customWidth,
          targetHeight: customHeight,
          maintainAspectRatio: false,
          fitMode: 'fill',
          backgroundColor: '#FFFFFF',
          targetKb: targetMaxKb,
          maxKbLimit: true,
          outputFormat: 'image/jpeg',
          quality: 0.9,
          rotation: 0,
        });

        setProcessedUrl(result.dataUrl);
        setProcessedDims({ w: customWidth, h: customHeight });
        setProcessedSizeKb(Math.round(result.outputSizeBytes / 1024));
        setIsProcessing(false);
      }, 'image/jpeg', 0.95);
    } catch (err) {
      setIsProcessing(false);
      toast.error('Processing failed');
    }
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const a = document.createElement('a');
    a.href = processedUrl;
    a.download = `${selectedExam.id}-${activeTab}-${customWidth}x${customHeight}-${processedSizeKb}kb.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success(`Exam ${activeTab} downloaded!`);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBg text-gray-900 dark:text-gray-100 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <FileCheck className="w-4 h-4" />
            UPSC • SSC • IBPS • RRB • NEET • JEE
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            Indian Exam Photo & Signature Resizer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            One-click compliance tool for Indian competitive exams. Automatically sets exact pixel dimensions (e.g. 200×230 px / 140×60 px), adds Name & Date of Photo (DOP) bar, and restricts file size strictly under 20 KB or 50 KB.
          </p>
        </div>

        <AdSenseUnit className="max-w-4xl mx-auto mb-8" />

        {/* Tab Switcher: Photo vs Signature */}
        <div className="max-w-md mx-auto flex p-1.5 bg-gray-200 dark:bg-gray-800 rounded-2xl mb-8">
          <button
            onClick={() => {
              setActiveTab('photo');
              if (originalFile) setTimeout(() => processExamImage(originalFile), 100);
            }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'photo'
                ? 'bg-white dark:bg-darkCard text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <span>Candidate Photo Resizer</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('signature');
              if (originalFile) setTimeout(() => processExamImage(originalFile), 100);
            }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
              activeTab === 'signature'
                ? 'bg-white dark:bg-darkCard text-amber-600 dark:text-amber-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            <span>Candidate Signature Resizer</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Settings Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Upload Box */}
            <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-600" /> 1. Upload Your {activeTab === 'photo' ? 'Photograph' : 'Signature'}
              </h2>

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
                }}
                className="border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-amber-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-gray-50/50 dark:bg-gray-850/50"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
                <FileCheck className="w-12 h-12 mx-auto text-amber-500 mb-2 opacity-80" />
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {originalFile ? originalFile.name : `Select ${activeTab} or drag & drop here`}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  JPG, JPEG, or PNG from phone or scanner.
                </p>
              </div>
            </div>

            {/* Exam Presets */}
            <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-3">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" /> 2. Select Exam Board
              </h2>

              <div className="space-y-2">
                {EXAM_RULES.map((exam) => (
                  <button
                    key={exam.id}
                    onClick={() => {
                      setSelectedExam(exam);
                      if (originalFile) setTimeout(() => processExamImage(originalFile), 50);
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-sm transition-all flex items-center justify-between ${
                      selectedExam.id === exam.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100 font-semibold ring-1 ring-amber-500'
                        : 'border-gray-200 dark:border-gray-750 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-darkCard text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div>
                      <div className="font-medium">{exam.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {activeTab === 'photo'
                          ? `Photo: ${exam.photoDims.w}×${exam.photoDims.h} px | ${exam.photoDims.minKb}KB–${exam.photoDims.maxKb}KB`
                          : `Signature: ${exam.sigDims.w}×${exam.sigDims.h} px | ${exam.sigDims.minKb}KB–${exam.sigDims.maxKb}KB`}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {exam.category}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Target Dimensions & Name Bar */}
            <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 space-y-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-600" /> 3. Output Dimensions & Limit
              </h2>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Width (pixels)</label>
                  <input
                    type="number"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Number(e.target.value))}
                    className="w-full mt-1 p-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Height (pixels)</label>
                  <input
                    type="number"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Number(e.target.value))}
                    className="w-full mt-1 p-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500 block mb-1">Target Max Size (KB)</label>
                <div className="flex gap-2">
                  {[20, 50, 100, 200].map((kb) => (
                    <button
                      key={kb}
                      onClick={() => setTargetMaxKb(kb)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                        targetMaxKb === kb
                          ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30 text-amber-600'
                          : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {kb} KB
                    </button>
                  ))}
                </div>
              </div>

              {/* Add Name and Date on Photo */}
              {activeTab === 'photo' && (
                <div className="pt-3 border-t border-gray-200 dark:border-gray-750">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer mb-2">
                    <input
                      type="checkbox"
                      checked={addNameDateBar}
                      onChange={(e) => setAddNameDateBar(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Add Name & Date of Photo (DOP) Strip</span>
                  </label>

                  {addNameDateBar && (
                    <div className="space-y-2 pl-6 mt-2">
                      <div>
                        <label className="text-xs text-gray-500">Candidate Full Name</label>
                        <input
                          type="text"
                          placeholder="e.g. RAHUL SHARMA"
                          value={candidateName}
                          onChange={(e) => setCandidateName(e.target.value)}
                          className="w-full mt-1 p-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-xs uppercase"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500">Date of Photo (DOP)</label>
                        <input
                          type="date"
                          value={photoDate}
                          onChange={(e) => setPhotoDate(e.target.value)}
                          className="w-full mt-1 p-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-900 text-xs"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {originalFile && (
                <button
                  onClick={() => processExamImage(originalFile)}
                  className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-all"
                >
                  <RefreshCw className="w-4 h-4" /> Re-apply Settings
                </button>
              )}
            </div>
          </div>

          {/* Output Preview Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Exam Compliant Output
                </h2>
                {processedSizeKb > 0 && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    processedSizeKb <= targetMaxKb
                      ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700'
                  }`}>
                    Size: {processedSizeKb} KB (Target ≤ {targetMaxKb} KB)
                  </span>
                )}
              </div>

              {/* Preview Container */}
              <div className="min-h-[380px] bg-gray-100 dark:bg-gray-900/60 rounded-xl p-4 flex flex-col items-center justify-center border border-dashed border-gray-300 dark:border-gray-800 overflow-hidden">
                {processedUrl ? (
                  <div className="flex flex-col items-center">
                    <img
                      src={processedUrl}
                      alt="Processed Exam"
                      className="max-h-[320px] object-contain rounded shadow border border-gray-300 dark:border-gray-700 bg-white"
                    />
                    <div className="mt-3 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 font-mono">
                      <span>Dimensions: {processedDims?.w} × {processedDims?.h} px</span>
                      <span>•</span>
                      <span>Format: JPEG</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <FileCheck className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Upload your image to inspect official portal compliance
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      Tested against UPSC, SSC, IBPS, and State Commission servers.
                    </p>
                  </div>
                )}
              </div>

              {/* Download Buttons */}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  disabled={!processedUrl || isProcessing}
                  onClick={handleDownload}
                  className="flex-1 min-w-[200px] py-3 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-semibold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-5 h-5" /> Download for {selectedExam.name.split(' ')[0]}
                </button>
                <button
                  onClick={() => {
                    setOriginalFile(null);
                    setOriginalPreview(null);
                    setProcessedUrl(null);
                  }}
                  disabled={!processedUrl}
                  className="py-3 px-4 rounded-xl border border-red-200 dark:border-red-900/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Board Instruction Box */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" /> Instructions for {selectedExam.name}
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed mb-3">
                {selectedExam.notes}
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs bg-white/60 dark:bg-darkCard/60 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30 font-mono">
                <div>
                  <span className="text-gray-500 block">Photo:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {selectedExam.photoDims.w}×{selectedExam.photoDims.h} px ({selectedExam.photoDims.minKb}–{selectedExam.photoDims.maxKb} KB)
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Signature:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {selectedExam.sigDims.w}×{selectedExam.sigDims.h} px ({selectedExam.sigDims.minKb}–{selectedExam.sigDims.maxKb} KB)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SuggestedTools currentToolId="indian-exam-resizer" onNavigate={onNavigateToTool} />
      </div>
    </div>
  );
};

export default IndianExamResizer;
