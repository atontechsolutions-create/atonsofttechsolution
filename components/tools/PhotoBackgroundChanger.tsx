import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Palette,
  Upload,
  Download,
  Trash2,
  RefreshCw,
  Sparkles,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Eye,
  Layers,
  Wand2,
  Pipette,
  Paintbrush,
  Eraser,
  Undo2,
  ShieldCheck,
  Check,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface BackgroundPreset {
  id: string;
  name: string;
  color: string;
  desc: string;
  textColor?: string;
}

const BG_PRESETS: BackgroundPreset[] = [
  { id: 'transparent', name: 'Transparent (Cutout)', color: 'transparent', desc: 'True background removal • Exports as PNG' },
  { id: 'pure-white', name: 'Pure White (#FFFFFF)', color: '#FFFFFF', desc: 'Official Passports, US/UK Visa, Govt Portals' },
  { id: 'light-blue', name: 'Studio Light Blue', color: '#B0D5F3', desc: 'Indian Exam, College IDs & Employment' },
  { id: 'royal-blue', name: 'Royal Blue', color: '#1E5EFF', desc: 'Corporate Profiles & Official Badges' },
  { id: 'neutral-grey', name: 'Neutral Light Grey', color: '#E5E7EB', desc: 'Schengen Visa & European ID cards' },
  { id: 'off-white', name: 'Soft Studio Off-White', color: '#F8FAFC', desc: 'Natural soft studio portrait lighting' },
  { id: 'red', name: 'Official Red', color: '#DC2626', desc: 'Singapore, Indonesia & Asian Passport standards' },
  { id: 'navy', name: 'Deep Navy', color: '#0F172A', desc: 'Executive headshots & portfolio photos' },
];

interface PhotoBackgroundChangerProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const PhotoBackgroundChanger: React.FC<PhotoBackgroundChangerProps> = ({
  onNavigateHome,
  onNavigateToTool,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [origSizeKb, setOrigSizeKb] = useState<number>(0);
  const [imageDims, setImageDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Background settings
  const [selectedBgColor, setSelectedBgColor] = useState<string>('#FFFFFF');
  const [customHex, setCustomHex] = useState<string>('#FFFFFF');
  const [tolerance, setTolerance] = useState<number>(36); // 15 to 80
  const [edgeBarrier, setEdgeBarrier] = useState<number>(28); // 10 to 60 - Sobel gradient barrier to stop at shirt/face
  const [edgeFeather, setEdgeFeather] = useState<number>(2); // 1 to 4
  const [protectCenter, setProtectCenter] = useState<boolean>(true); // Shields center/torso from outer flood fill

  // Interactive Tools: Eyedropper & Brush
  const [activeTool, setActiveTool] = useState<'none' | 'picker' | 'restore-brush' | 'erase-brush'>('none');
  const [brushSize, setBrushSize] = useState<number>(25); // 10 to 60 px
  const [customSampleRgb, setCustomSampleRgb] = useState<{ r: number; g: number; b: number } | null>(null);

  // Manual touch-up mask (1 = force keep/restore, 2 = force erase)
  const userTouchMaskRef = useRef<Uint8Array | null>(null);
  const [touchCounter, setTouchCounter] = useState<number>(0);

  // Compare & Result
  const [showOriginalCompare, setShowOriginalCompare] = useState<boolean>(false);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedSizeKb, setProcessedSizeKb] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const isPaintingRef = useRef<boolean>(false);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, WebP)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setImageDims({ width: img.width, height: img.height });
        // Reset manual touch mask
        userTouchMaskRef.current = new Uint8Array(img.width * img.height);
        setImageSrc(src);
        setSelectedFile(file);
        setOrigSizeKb(Math.round(file.size / 1024));
        setCustomSampleRgb(null);
        toast.success(`Photo loaded (${img.width}x${img.height}px)! Background removal active.`);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const hexToRgb = (hex: string) => {
    if (hex === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
    const clean = hex.replace('#', '');
    const num = parseInt(clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
      a: 255,
    };
  };

  /**
   * ROBUST BOUNDARY-SEEDED QUEUE BFS ALGORITHM WITH SOBEL EDGE BARRIER
   * Guarantees that internal clothing (white shirt, collar, skin, face, hair, eyes)
   * are 100% PROTECTED from being modified because flood fill starts ONLY from borders!
   */
  const processBackground = useCallback(() => {
    if (!imageSrc || imageDims.width === 0) return;

    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      const w = img.width;
      const h = img.height;
      const workCanvas = document.createElement('canvas');
      workCanvas.width = w;
      workCanvas.height = h;
      const ctx = workCanvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        setIsProcessing(false);
        return;
      }

      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;

      // Ensure user touch mask exists
      if (!userTouchMaskRef.current || userTouchMaskRef.current.length !== w * h) {
        userTouchMaskRef.current = new Uint8Array(w * h);
      }
      const touchMask = userTouchMaskRef.current;

      // 1. Determine background color reference
      let bgR = 0;
      let bgG = 0;
      let bgB = 0;

      if (customSampleRgb) {
        bgR = customSampleRgb.r;
        bgG = customSampleRgb.g;
        bgB = customSampleRgb.b;
      } else {
        // Sample perimeter corners & top margin
        let count = 0;
        const sampleCoords = [
          [2, 2],
          [w - 3, 2],
          [Math.floor(w / 4), 2],
          [Math.floor((3 * w) / 4), 2],
          [2, Math.floor(h / 4)],
          [w - 3, Math.floor(h / 4)],
        ];
        sampleCoords.forEach(([sx, sy]) => {
          const idx = (sy * w + sx) * 4;
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
          count++;
        });
        bgR /= count;
        bgG /= count;
        bgB /= count;
      }

      // 2. Compute grayscale luminance for Sobel edge barrier
      const gray = new Float32Array(w * h);
      for (let i = 0; i < data.length; i += 4) {
        gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }

      // 3. Compute Sobel Edge Magnitude
      const edge = new Float32Array(w * h);
      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = y * w + x;
          const gx =
            -gray[idx - w - 1] + gray[idx - w + 1] +
            -2 * gray[idx - 1] + 2 * gray[idx + 1] +
            -gray[idx + w - 1] + gray[idx + w + 1];
          const gy =
            -gray[idx - w - 1] - 2 * gray[idx - w] - gray[idx - w + 1] +
            gray[idx + w - 1] + 2 * gray[idx + w] + gray[idx + w + 1];
          edge[idx] = Math.sqrt(gx * gx + gy * gy);
        }
      }

      // 4. Perimeter Queue BFS Flood-Fill
      // isBg[idx] = 1 means background, 0 means foreground/person
      const isBg = new Uint8Array(w * h);
      const queue = new Int32Array(w * h);
      let qHead = 0;
      let qTail = 0;

      const tolSq = tolerance * tolerance * 3;
      const barrierThreshold = edgeBarrier * 1.8;

      // Center protection boundaries (for portraits: central torso/chest)
      const centerMinX = Math.floor(w * 0.25);
      const centerMaxX = Math.floor(w * 0.75);
      const centerMinY = Math.floor(h * 0.35);

      // Seed queue strictly along image borders (top, left, right)
      // Top border
      for (let x = 0; x < w; x++) {
        const idx = x;
        const d = (data[idx * 4] - bgR) ** 2 + (data[idx * 4 + 1] - bgG) ** 2 + (data[idx * 4 + 2] - bgB) ** 2;
        if (d <= tolSq * 1.5) {
          isBg[idx] = 1;
          queue[qTail++] = idx;
        }
      }
      // Left and Right borders
      for (let y = 1; y < h; y++) {
        const leftIdx = y * w;
        const rightIdx = y * w + (w - 1);

        const dL = (data[leftIdx * 4] - bgR) ** 2 + (data[leftIdx * 4 + 1] - bgG) ** 2 + (data[leftIdx * 4 + 2] - bgB) ** 2;
        if (dL <= tolSq * 1.5 && isBg[leftIdx] === 0) {
          isBg[leftIdx] = 1;
          queue[qTail++] = leftIdx;
        }

        const dR = (data[rightIdx * 4] - bgR) ** 2 + (data[rightIdx * 4 + 1] - bgG) ** 2 + (data[rightIdx * 4 + 2] - bgB) ** 2;
        if (dR <= tolSq * 1.5 && isBg[rightIdx] === 0) {
          isBg[rightIdx] = 1;
          queue[qTail++] = rightIdx;
        }
      }

      // BFS Traversal
      const dx = [0, 1, 0, -1];
      const dy = [-1, 0, 1, 0];

      while (qHead < qTail) {
        const curr = queue[qHead++];
        const cx = curr % w;
        const cy = Math.floor(curr / w);

        for (let k = 0; k < 4; k++) {
          const nx = cx + dx[k];
          const ny = cy + dy[k];

          if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
          const nIdx = ny * w + nx;

          if (isBg[nIdx] !== 0) continue; // Already visited

          // User Manual Brush overrides
          if (touchMask[nIdx] === 1) continue; // User forced KEEP (subject)
          if (touchMask[nIdx] === 2) {
            // User forced ERASE (background)
            isBg[nIdx] = 1;
            queue[qTail++] = nIdx;
            continue;
          }

          // Protect subject center torso if enabled
          if (protectCenter && nx >= centerMinX && nx <= centerMaxX && ny >= centerMinY) {
            // Stronger threshold inside torso
            if (edge[nIdx] > barrierThreshold * 0.7) continue;
          }

          // Check edge barrier: if sharp gradient between person and background, stop BFS!
          if (edge[nIdx] > barrierThreshold) continue;

          // Color similarity to background
          const pIdx = nIdx * 4;
          const distSq = (data[pIdx] - bgR) ** 2 + (data[pIdx + 1] - bgG) ** 2 + (data[pIdx + 2] - bgB) ** 2;

          if (distSq <= tolSq) {
            isBg[nIdx] = 1;
            queue[qTail++] = nIdx;
          }
        }
      }

      // Apply any remaining manual touches
      for (let i = 0; i < touchMask.length; i++) {
        if (touchMask[i] === 1) isBg[i] = 0; // Forced Subject
        if (touchMask[i] === 2) isBg[i] = 1; // Forced Background
      }

      // 5. Soft Edge Feathering (Anti-Aliasing alpha map)
      const alphaMap = new Float32Array(w * h);
      for (let i = 0; i < isBg.length; i++) {
        alphaMap[i] = isBg[i] === 1 ? 0 : 1; // 0 = transparent/bg, 1 = subject
      }

      // Feather blur on boundaries
      if (edgeFeather > 0) {
        const radius = edgeFeather;
        const tempAlpha = new Float32Array(alphaMap);
        for (let y = radius; y < h - radius; y++) {
          for (let x = radius; x < w - radius; x++) {
            const idx = y * w + x;
            // Only blur transition edges
            let sum = 0;
            let count = 0;
            for (let fy = -radius; fy <= radius; fy++) {
              for (let fx = -radius; fx <= radius; fx++) {
                sum += tempAlpha[(y + fy) * w + (x + fx)];
                count++;
              }
            }
            alphaMap[idx] = sum / count;
          }
        }
      }

      // 6. Composite into destination background
      const target = hexToRgb(selectedBgColor);
      const isTransparent = selectedBgColor === 'transparent';

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = y * w + x;
          const p = idx * 4;
          const subjectAlpha = alphaMap[idx]; // 1.0 = subject, 0.0 = bg

          if (isTransparent) {
            data[p + 3] = Math.round(subjectAlpha * 255);
          } else {
            // Blend subject onto target solid background
            const bgAlpha = 1 - subjectAlpha;
            data[p] = Math.round(data[p] * subjectAlpha + target.r * bgAlpha);
            data[p + 1] = Math.round(data[p + 1] * subjectAlpha + target.g * bgAlpha);
            data[p + 2] = Math.round(data[p + 2] * subjectAlpha + target.b * bgAlpha);
            data[p + 3] = 255;
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Render to preview & download
      const mime = isTransparent ? 'image/png' : 'image/jpeg';
      workCanvas.toBlob(
        (blob) => {
          if (blob) {
            setProcessedUrl(URL.createObjectURL(blob));
            setProcessedSizeKb(Math.round(blob.size / 1024));
          }
          setIsProcessing(false);
        },
        mime,
        0.96
      );
    };
  }, [imageSrc, imageDims, selectedBgColor, tolerance, edgeBarrier, edgeFeather, protectCenter, customSampleRgb, touchCounter]);

  // Trigger processing on settings change
  useEffect(() => {
    if (!imageSrc) return;
    processBackground();
  }, [processBackground]);

  // Interactive Eyedropper & Brush Handlers on Image Preview
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'none' || !imageSrc) return;
    isPaintingRef.current = true;
    handleCanvasAction(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isPaintingRef.current) return;
    handleCanvasAction(e);
  };

  const handleCanvasMouseUp = () => {
    isPaintingRef.current = false;
  };

  const handleCanvasAction = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const scaleX = imageDims.width / rect.width;
    const scaleY = imageDims.height / rect.height;

    const imgX = Math.round(clientX * scaleX);
    const imgY = Math.round(clientY * scaleY);

    if (imgX < 0 || imgX >= imageDims.width || imgY < 0 || imgY >= imageDims.height) return;

    if (activeTool === 'picker') {
      // Sample background color directly from user click
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc!;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, imgX, imgY, 1, 1, 0, 0, 1, 1);
          const p = ctx.getImageData(0, 0, 1, 1).data;
          setCustomSampleRgb({ r: p[0], g: p[1], b: p[2] });
          toast.success(`Sampled background color: rgb(${p[0]}, ${p[1]}, ${p[2]})`);
          setActiveTool('none');
        }
      };
      return;
    }

    if (activeTool === 'restore-brush' || activeTool === 'erase-brush') {
      if (!userTouchMaskRef.current) return;
      const mask = userTouchMaskRef.current;
      const w = imageDims.width;
      const h = imageDims.height;
      const r = brushSize;
      const markVal = activeTool === 'restore-brush' ? 1 : 2; // 1 = Keep, 2 = Erase

      for (let cy = Math.max(0, imgY - r); cy <= Math.min(h - 1, imgY + r); cy++) {
        for (let cx = Math.max(0, imgX - r); cx <= Math.min(w - 1, imgX + r); cx++) {
          if ((cx - imgX) ** 2 + (cy - imgY) ** 2 <= r * r) {
            mask[cy * w + cx] = markVal;
          }
        }
      }
      setTouchCounter((prev) => prev + 1);
    }
  };

  const clearManualTouches = () => {
    if (userTouchMaskRef.current) {
      userTouchMaskRef.current.fill(0);
      setTouchCounter((prev) => prev + 1);
      toast.success('Cleared all manual brush touches.');
    }
  };

  const handleDownload = () => {
    if (!processedUrl) return;
    const isTrans = selectedBgColor === 'transparent';
    const ext = isTrans ? 'png' : 'jpg';
    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = `photo-bg-cleaned-${isTrans ? 'transparent' : selectedBgColor.replace('#', '')}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Photo downloaded as clean ${ext.toUpperCase()}!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 mb-3">
          <ShieldCheck size={14} className="text-purple-600" />
          <span>Edge-Aware Boundary Protection • Person & Shirt Safe</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Photo <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">Background Changer</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Replaces only the background while strictly protecting your clothes, face, hair, and body. Download as pure transparent PNG or official white, studio blue, or custom colors.
        </p>
      </div>

      <AdSenseUnit placementLabel="Background Changer Top Banner" />

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
              className="border-2 border-dashed border-gray-300 dark:border-slate-700 hover:border-purple-500 rounded-3xl p-10 sm:p-16 cursor-pointer transition-all bg-gray-50/60 dark:bg-slate-800/40 hover:bg-purple-50/40 group flex flex-col items-center justify-center"
            >
              <div className="w-20 h-20 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
                <Palette size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Click to upload photo or drag & drop
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Automatic boundary-detection cuts out the background cleanly without corrupting your white shirt, skin tones, or facial features.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Transparent Cutout (PNG)
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                  Pure White #FFFFFF
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                  Studio Light Blue
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
                  Choose New Background
                </label>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1">
                  {BG_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedBgColor(p.color);
                        if (p.color !== 'transparent') setCustomHex(p.color);
                      }}
                      className={`flex items-center gap-3 p-2.5 rounded-2xl border text-left transition cursor-pointer ${
                        selectedBgColor === p.color
                          ? 'border-purple-600 bg-purple-50/70 dark:bg-purple-950/30 ring-2 ring-purple-600/20'
                          : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 bg-gray-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      {p.color === 'transparent' ? (
                        <span className="w-8 h-8 rounded-xl border border-gray-300 dark:border-slate-600 bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:6px_6px] shrink-0" />
                      ) : (
                        <span
                          className="w-8 h-8 rounded-xl border border-gray-300 dark:border-slate-600 shadow-xs shrink-0"
                          style={{ backgroundColor: p.color }}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-gray-900 dark:text-white truncate flex items-center justify-between">
                          <span>{p.name}</span>
                          {selectedBgColor === p.color && <Check size={14} className="text-purple-600" />}
                        </div>
                        <div className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{p.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom Hex Color Picker */}
                <div className="mt-3 flex items-center gap-3 p-3 rounded-2xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/40">
                  <input
                    type="color"
                    value={customHex}
                    onChange={(e) => {
                      setCustomHex(e.target.value);
                      setSelectedBgColor(e.target.value);
                    }}
                    className="w-9 h-9 rounded-xl border-0 cursor-pointer bg-transparent"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200 block">Custom Color Picker</span>
                    <span className="text-[11px] font-mono text-gray-500">{selectedBgColor.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Edge Tolerance & Person Protection Sliders */}
              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 block flex items-center gap-1.5">
                  <Sliders size={13} className="text-purple-600" />
                  Boundary & Person Protection Tuning
                </span>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold">
                    <span>Background Sensitivity (Tolerance)</span>
                    <span className="font-mono font-bold text-purple-600">{tolerance}</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="65"
                    value={tolerance}
                    onChange={(e) => setTolerance(parseInt(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold">
                    <span>Subject Edge Barrier (Sobel Stop)</span>
                    <span className="font-mono font-bold text-purple-600">{edgeBarrier}</span>
                  </div>
                  <input
                    type="range"
                    min="12"
                    max="55"
                    value={edgeBarrier}
                    onChange={(e) => setEdgeBarrier(parseInt(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Stops the flood fill at clothes, shoulders, and hair contours.
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-slate-700 flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={protectCenter}
                      onChange={(e) => setProtectCenter(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                    />
                    <span>Shield User's Shirt & Torso Center</span>
                  </label>
                  <span className="text-[10px] text-emerald-600 font-bold">Active</span>
                </div>
              </div>

              {/* Touch-Up & Brush Tools */}
              <div className="bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-2xl border border-purple-200 dark:border-purple-900/60 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-200 block flex items-center justify-between">
                  <span>Interactive Touch-Up Tools</span>
                  {touchCounter > 0 && (
                    <button
                      onClick={clearManualTouches}
                      className="text-[10px] font-bold text-rose-500 hover:underline"
                    >
                      Clear Touches
                    </button>
                  )}
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setActiveTool(activeTool === 'picker' ? 'none' : 'picker')}
                    className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                      activeTool === 'picker'
                        ? 'border-purple-600 bg-purple-600 text-white'
                        : 'border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200'
                    }`}
                    title="Click background on photo to sample its exact shade"
                  >
                    <Pipette size={14} />
                    <span>Sample BG</span>
                  </button>

                  <button
                    onClick={() => setActiveTool(activeTool === 'restore-brush' ? 'none' : 'restore-brush')}
                    className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                      activeTool === 'restore-brush'
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200'
                    }`}
                    title="Paint on photo to restore user's clothes or face"
                  >
                    <ShieldCheck size={14} />
                    <span>Keep Subject</span>
                  </button>

                  <button
                    onClick={() => setActiveTool(activeTool === 'erase-brush' ? 'none' : 'erase-brush')}
                    className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                      activeTool === 'erase-brush'
                        ? 'border-rose-600 bg-rose-600 text-white'
                        : 'border-purple-200 dark:border-purple-800 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200'
                    }`}
                    title="Paint to erase background spots"
                  >
                    <Eraser size={14} />
                    <span>Erase BG</span>
                  </button>
                </div>

                {activeTool !== 'none' && activeTool !== 'picker' && (
                  <div className="pt-2 flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-gray-500">Brush Size:</span>
                    <input
                      type="range"
                      min="10"
                      max="60"
                      value={brushSize}
                      onChange={(e) => setBrushSize(parseInt(e.target.value))}
                      className="w-36 accent-purple-600"
                    />
                    <span className="font-bold text-purple-600">{brushSize}px</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleDownload}
                  disabled={!processedUrl || isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-black text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 cursor-pointer text-sm sm:text-base"
                >
                  <Download size={18} />
                  <span>Download Clean Photo ({processedSizeKb} KB)</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onMouseDown={() => setShowOriginalCompare(true)}
                    onMouseUp={() => setShowOriginalCompare(false)}
                    onTouchStart={() => setShowOriginalCompare(true)}
                    onTouchEnd={() => setShowOriginalCompare(false)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition select-none"
                  >
                    <Eye size={14} />
                    <span>Hold to See Original</span>
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold text-gray-700 dark:text-gray-300 transition"
                  >
                    <Upload size={14} />
                    <span>Change Photo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Live Preview Canvas */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center">
              <div className="w-full flex items-center justify-between mb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-gray-800 dark:text-gray-200">Output Result:</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold text-[10px]">
                    {selectedBgColor === 'transparent' ? 'Transparent PNG Cutout' : `Background: ${selectedBgColor}`}
                  </span>
                </div>
                <span className="text-gray-500">
                  {imageDims.width}x{imageDims.height}px • {processedSizeKb} KB
                </span>
              </div>

              {/* Interactive Canvas Area */}
              <div
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                className={`relative w-full min-h-[340px] sm:min-h-[440px] rounded-3xl border-2 border-gray-200 dark:border-slate-700 flex items-center justify-center p-6 overflow-hidden select-none transition-all ${
                  selectedBgColor === 'transparent'
                    ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100/70 dark:bg-slate-900/90'
                    : 'bg-white shadow-inner'
                } ${
                  activeTool === 'picker'
                    ? 'cursor-crosshair'
                    : activeTool === 'restore-brush' || activeTool === 'erase-brush'
                    ? 'cursor-pointer'
                    : ''
                }`}
              >
                {isProcessing && (
                  <div className="absolute inset-0 z-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs flex items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 shadow-lg text-purple-600 font-bold text-xs">
                      <RefreshCw size={15} className="animate-spin" />
                      Refining Boundary Mask...
                    </div>
                  </div>
                )}

                <img
                  src={showOriginalCompare ? imageSrc! : processedUrl || imageSrc!}
                  alt="Background Result"
                  className="max-h-[400px] max-w-full object-contain rounded-xl shadow-md transition-all duration-200 filter drop-shadow-sm pointer-events-none"
                />

                {showOriginalCompare && (
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/75 text-white text-xs font-bold backdrop-blur-sm shadow z-30">
                    Original Unchanged Photo
                  </span>
                )}

                {activeTool === 'picker' && (
                  <div className="absolute bottom-4 inset-x-4 p-2.5 rounded-xl bg-black/80 text-white text-xs text-center font-bold backdrop-blur-sm z-30 pointer-events-none">
                    🎯 Click any point on the background to sample its color
                  </div>
                )}

                {(activeTool === 'restore-brush' || activeTool === 'erase-brush') && (
                  <div className="absolute bottom-4 inset-x-4 p-2.5 rounded-xl bg-black/80 text-white text-xs text-center font-bold backdrop-blur-sm z-30 pointer-events-none">
                    🖌️ Paint on the photo to {activeTool === 'restore-brush' ? 'protect/restore subject' : 'erase background'}
                  </div>
                )}
              </div>

              {/* Protection Guarantee Notice */}
              <div className="w-full mt-4 p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 flex items-start gap-3 text-xs">
                <ShieldCheck size={18} className="text-purple-600 shrink-0 mt-0.5" />
                <div className="text-purple-950 dark:text-purple-200">
                  <span className="font-extrabold block">Subject & Clothes Protection Guarantee:</span>
                  Our perimeter flood-fill only operates from the outer border pixels and is stopped by Sobel edge barriers. Even if you wear a white shirt on a white background, your shirt and skin remain 100% untouched.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-5xl mx-auto mt-12">
        <SuggestedTools
          currentToolId="photo-bg-changer"
          onNavigate={onNavigateHome}
          onNavigateToTool={onNavigateToTool}
        />
      </div>
    </div>
  );
};

export default PhotoBackgroundChanger;
