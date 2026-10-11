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
  Cpu,
  Zap,
  Image as ImageIcon,
  ChevronsLeftRight,
  Split,
  SlidersHorizontal,
} from 'lucide-react';
import { SelfieSegmentation } from '@mediapipe/selfie_segmentation';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface BackgroundPreset {
  id: string;
  name: string;
  color: string;
  desc: string;
}

const BG_PRESETS: BackgroundPreset[] = [
  { id: 'transparent', name: 'Transparent Cutout', color: 'transparent', desc: 'True background removal • Exports as PNG' },
  { id: 'pure-white', name: 'Pure White (#FFFFFF)', color: '#FFFFFF', desc: 'Official Passports, US/UK Visa & Exam Portals' },
  { id: 'light-blue', name: 'Studio Light Blue', color: '#B0D5F3', desc: 'Indian Exam, College IDs & Employment forms' },
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

type SegmentationEngine = 'ai-mediapipe' | 'edge-floodfill';

const PhotoBackgroundChanger: React.FC<PhotoBackgroundChangerProps> = ({
  onNavigateHome,
  onNavigateToTool,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [origSizeKb, setOrigSizeKb] = useState<number>(0);
  const [imageDims, setImageDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // Engine selection
  const [engine, setEngine] = useState<SegmentationEngine>('ai-mediapipe');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Background settings
  const [selectedBgColor, setSelectedBgColor] = useState<string>('#FFFFFF');
  const [customHex, setCustomHex] = useState<string>('#FFFFFF');
  const [maskThreshold, setMaskThreshold] = useState<number>(0.45); // 0.1 to 0.9 (AI confidence threshold)
  const [edgeFeather, setEdgeFeather] = useState<number>(2); // 0 to 4 px soft edge
  const [tolerance, setTolerance] = useState<number>(36); // for flood-fill engine
  const [edgeBarrier, setEdgeBarrier] = useState<number>(28); // for flood-fill engine

  // Interactive Tools: Eyedropper & Brush
  const [activeTool, setActiveTool] = useState<'none' | 'picker' | 'restore-brush' | 'erase-brush'>('none');
  const [brushSize, setBrushSize] = useState<number>(25); // 10 to 60 px
  const [customSampleRgb, setCustomSampleRgb] = useState<{ r: number; g: number; b: number } | null>(null);

  // Masks
  const aiMaskRef = useRef<Float32Array | null>(null); // Stored 0.0 - 1.0 foreground confidence
  const userTouchMaskRef = useRef<Uint8Array | null>(null); // 1 = force keep, 2 = force erase
  const [touchCounter, setTouchCounter] = useState<number>(0);
  const selfieSegmentationRef = useRef<SelfieSegmentation | null>(null);

  // Compare & Result
  const [showOriginalCompare, setShowOriginalCompare] = useState<boolean>(false);
  const [sliderPos, setSliderPos] = useState<number>(50); // 0 to 100% split
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'slider' | 'result'>('slider');
  const [isDropDragging, setIsDropDragging] = useState<boolean>(false);
  const sliderContainerRef = useRef<HTMLDivElement | null>(null);

  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [processedSizeKb, setProcessedSizeKb] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPaintingRef = useRef<boolean>(false);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDropDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Slider interaction handlers
  const handleSliderMove = useCallback((clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    if (rect.width <= 0) return;
    const offsetX = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const pct = Math.round((offsetX / rect.width) * 100);
    setSliderPos(pct);
  }, []);

  const handleSliderPointerDown = (e: React.PointerEvent) => {
    if (activeTool !== 'none') return; // let brush / picker work when active
    setIsDraggingSlider(true);
    handleSliderMove(e.clientX);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {}
  };

  const handleSliderPointerMove = (e: React.PointerEvent) => {
    if (isDraggingSlider) {
      handleSliderMove(e.clientX);
    }
  };

  const handleSliderPointerUp = (e: React.PointerEvent) => {
    setIsDraggingSlider(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  // Initialize MediaPipe once
  useEffect(() => {
    try {
      const segmenter = new SelfieSegmentation({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
      });
      segmenter.setOptions({
        modelSelection: 1, // 1 = High-accuracy portrait model
        selfieMode: false,
      });
      selfieSegmentationRef.current = segmenter;
    } catch (err) {
      console.warn('Failed to pre-initialize SelfieSegmentation:', err);
    }

    return () => {
      if (selfieSegmentationRef.current) {
        try {
          selfieSegmentationRef.current.close();
        } catch {
          // ignore
        }
      }
    };
  }, []);

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
        userTouchMaskRef.current = new Uint8Array(img.width * img.height);
        aiMaskRef.current = null;
        setImageSrc(src);
        setSelectedFile(file);
        setOrigSizeKb(Math.round(file.size / 1024));
        setCustomSampleRgb(null);
        setTouchCounter(0);
        toast.success(`Photo loaded (${img.width}x${img.height}px)! Initializing AI body segmentation...`);
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
   * Run AI Neural Body Segmentation using Google MediaPipe
   * Extracts pixel-exact foreground person confidence mask (0.0 to 1.0)
   */
  const runAiSegmentation = useCallback(async (img: HTMLImageElement): Promise<Float32Array | null> => {
    setIsAiLoading(true);
    setAiError(null);

    return new Promise((resolve) => {
      try {
        let segmenter = selfieSegmentationRef.current;
        if (!segmenter) {
          segmenter = new SelfieSegmentation({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
          });
          segmenter.setOptions({
            modelSelection: 1,
            selfieMode: false,
          });
          selfieSegmentationRef.current = segmenter;
        }

        // Set timeout in case network blocks CDN
        const timeoutId = setTimeout(() => {
          console.warn('AI segmentation timed out; falling back to boundary engine.');
          setAiError('AI model download timed out. Falling back to edge-aware engine.');
          setIsAiLoading(false);
          resolve(null);
        }, 9000);

        segmenter.onResults((results) => {
          clearTimeout(timeoutId);
          setIsAiLoading(false);

          const w = img.width;
          const h = img.height;
          const maskCanvas = document.createElement('canvas');
          maskCanvas.width = w;
          maskCanvas.height = h;
          const mCtx = maskCanvas.getContext('2d');
          if (!mCtx) {
            resolve(null);
            return;
          }

          mCtx.drawImage(results.segmentationMask, 0, 0, w, h);
          const maskImgData = mCtx.getImageData(0, 0, w, h);
          const mData = maskImgData.data;

          const mask = new Float32Array(w * h);
          for (let i = 0; i < mask.length; i++) {
            // In MediaPipe results, white represents the person foreground
            mask[i] = mData[i * 4] / 255.0;
          }

          resolve(mask);
        });

        segmenter.send({ image: img }).catch((err) => {
          clearTimeout(timeoutId);
          console.warn('MediaPipe send error:', err);
          setIsAiLoading(false);
          setAiError('AI model error. Using edge-aware fallback engine.');
          resolve(null);
        });
      } catch (err) {
        console.warn('MediaPipe initialization error:', err);
        setIsAiLoading(false);
        setAiError('AI segmentation unavailable. Using edge-aware fallback engine.');
        resolve(null);
      }
    });
  }, []);

  /**
   * Fallback Boundary-Seeded Queue BFS Flood-Fill
   */
  const computeBoundaryFloodFillMask = useCallback((
    imgData: ImageData,
    w: number,
    h: number
  ): Float32Array => {
    const data = imgData.data;
    let bgR = 0, bgG = 0, bgB = 0;

    if (customSampleRgb) {
      bgR = customSampleRgb.r;
      bgG = customSampleRgb.g;
      bgB = customSampleRgb.b;
    } else {
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

    const gray = new Float32Array(w * h);
    for (let i = 0; i < data.length; i += 4) {
      gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }

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

    const isBg = new Uint8Array(w * h);
    const queue = new Int32Array(w * h);
    let qHead = 0;
    let qTail = 0;

    const tolSq = tolerance * tolerance * 3;
    const barrier = edgeBarrier * 1.8;

    for (let x = 0; x < w; x++) {
      const idx = x;
      const d = (data[idx * 4] - bgR) ** 2 + (data[idx * 4 + 1] - bgG) ** 2 + (data[idx * 4 + 2] - bgB) ** 2;
      if (d <= tolSq * 1.5) {
        isBg[idx] = 1;
        queue[qTail++] = idx;
      }
    }

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
        if (isBg[nIdx] !== 0) continue;
        if (edge[nIdx] > barrier) continue;

        const pIdx = nIdx * 4;
        const distSq = (data[pIdx] - bgR) ** 2 + (data[pIdx + 1] - bgG) ** 2 + (data[pIdx + 2] - bgB) ** 2;
        if (distSq <= tolSq) {
          isBg[nIdx] = 1;
          queue[qTail++] = nIdx;
        }
      }
    }

    const mask = new Float32Array(w * h);
    for (let i = 0; i < mask.length; i++) {
      mask[i] = isBg[i] === 1 ? 0 : 1; // 1 = foreground person, 0 = background
    }
    return mask;
  }, [tolerance, edgeBarrier, customSampleRgb]);

  /**
   * Final Composite Function:
   * Uses precise person mask, feathering, user touches, and applies background color!
   */
  const compositeFinalImage = useCallback((
    img: HTMLImageElement,
    rawMask: Float32Array
  ) => {
    const w = img.width;
    const h = img.height;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.drawImage(img, 0, 0);
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;

    const touchMask = userTouchMaskRef.current || new Uint8Array(w * h);

    // 1. Build thresholded alpha mask
    const alphaMask = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      // Manual touches override
      if (touchMask[i] === 1) {
        alphaMask[i] = 1.0; // Force Keep (Subject)
      } else if (touchMask[i] === 2) {
        alphaMask[i] = 0.0; // Force Erase (Background)
      } else {
        const conf = rawMask[i];
        if (conf >= maskThreshold) {
          // Linear ramp around threshold for smooth anti-aliased hair & shoulders
          const ramp = Math.min(1.0, (conf - maskThreshold) / 0.15 + 0.5);
          alphaMask[i] = ramp;
        } else {
          alphaMask[i] = 0.0;
        }
      }
    }

    // 2. Soft Edge Feathering / Anti-Aliasing
    if (edgeFeather > 0) {
      const radius = edgeFeather;
      const copyMask = new Float32Array(alphaMask);
      for (let y = radius; y < h - radius; y++) {
        for (let x = radius; x < w - radius; x++) {
          const idx = y * w + x;
          const centerVal = copyMask[idx];
          // Only feather pixels near the boundary transition (between 0.05 and 0.95)
          if (centerVal > 0.05 && centerVal < 0.95) {
            let sum = 0;
            let count = 0;
            for (let fy = -radius; fy <= radius; fy++) {
              for (let fx = -radius; fx <= radius; fx++) {
                sum += copyMask[(y + fy) * w + (x + fx)];
                count++;
              }
            }
            alphaMask[idx] = sum / count;
          }
        }
      }
    }

    // 3. Composite into target background
    const target = hexToRgb(selectedBgColor);
    const isTransparent = selectedBgColor === 'transparent';

    for (let i = 0; i < w * h; i++) {
      const p = i * 4;
      const personAlpha = Math.max(0, Math.min(1, alphaMask[i])); // 1 = person, 0 = bg

      if (isTransparent) {
        data[p + 3] = Math.round(data[p + 3] * personAlpha);
      } else {
        const bgAlpha = 1 - personAlpha;
        // Blend original person pixels with target solid background
        data[p] = Math.round(data[p] * personAlpha + target.r * bgAlpha);
        data[p + 1] = Math.round(data[p + 1] * personAlpha + target.g * bgAlpha);
        data[p + 2] = Math.round(data[p + 2] * personAlpha + target.b * bgAlpha);
        data[p + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);

    const mime = isTransparent ? 'image/png' : 'image/jpeg';
    canvas.toBlob(
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
  }, [selectedBgColor, maskThreshold, edgeFeather]);

  /**
   * Main Pipeline Coordinator:
   * Reuses cached AI mask when changing colors or sliders, avoiding slow recalculations!
   */
  const processImage = useCallback(async () => {
    if (!imageSrc || imageDims.width === 0) return;

    setIsProcessing(true);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;

    img.onload = async () => {
      let mask = aiMaskRef.current;

      // If in AI mode and no mask cached, compute with MediaPipe
      if (engine === 'ai-mediapipe' && !mask) {
        mask = await runAiSegmentation(img);
        if (mask) {
          aiMaskRef.current = mask;
        } else {
          // Fallback to flood-fill
          setEngine('edge-floodfill');
        }
      }

      // If in flood-fill engine (or AI fallback)
      if (engine === 'edge-floodfill' || !mask) {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imgData = ctx.getImageData(0, 0, img.width, img.height);
          mask = computeBoundaryFloodFillMask(imgData, img.width, img.height);
        }
      }

      if (mask) {
        compositeFinalImage(img, mask);
      } else {
        setIsProcessing(false);
      }
    };
  }, [imageSrc, imageDims, engine, runAiSegmentation, computeBoundaryFloodFillMask, compositeFinalImage]);

  // Trigger processing on settings change
  useEffect(() => {
    if (!imageSrc) return;
    processImage();
  }, [processImage, touchCounter]);

  // Reset cached AI mask if engine changed manually
  const switchEngine = (newEngine: SegmentationEngine) => {
    setEngine(newEngine);
    aiMaskRef.current = null;
  };

  // Interactive Eyedropper & Brush Handlers
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
          // re-run flood fill if in fallback
          if (engine === 'edge-floodfill') {
            aiMaskRef.current = null;
          }
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
      toast.success('Cleared all manual touch-up brush strokes.');
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
    toast.success(`Photo downloaded with clean ${isTrans ? 'transparent background' : 'color'}!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800 mb-3">
          <ShieldCheck size={14} className="text-purple-600" />
          <span>AI Neural Body Segmentation • 100% Foreground Protected</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Photo <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600">Background Changer</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Deep-learning body segmentation isolates the person (clothes, shirt, face, hair) so the foreground remains completely untouched while only the background is processed.
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
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-10 sm:p-16 cursor-pointer transition-all group flex flex-col items-center justify-center ${
                isDropDragging
                  ? 'border-purple-600 bg-purple-50/80 dark:bg-purple-950/40 ring-4 ring-purple-500/20 scale-[0.99]'
                  : 'border-gray-300 dark:border-slate-700 hover:border-purple-500 bg-gray-50/60 dark:bg-slate-800/40 hover:bg-purple-50/40'
              }`}
            >
              <div className="w-20 h-20 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-inner">
                <Palette size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Click to upload photo or drag & drop
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Precise neural segmentation detects your body contours and replaces the background without corrupting your white shirt, skin tones, or hair.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 flex items-center gap-1.5">
                  <Cpu size={12} /> AI Body Segmentation
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Transparent Cutout (PNG)
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                  Pure White #FFFFFF
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
            {/* Left Controls */}
            <div className="lg:col-span-5 space-y-6">
              {/* Segmentation Engine Toggle */}
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Cpu size={14} className="text-purple-600" />
                    Segmentation Engine:
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    {engine === 'ai-mediapipe'
                      ? 'AI Neural Network (Google MediaPipe)'
                      : 'Edge-Aware Topological Boundary Fill'}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-gray-200 dark:border-slate-700 text-xs font-bold">
                  <button
                    onClick={() => switchEngine('ai-mediapipe')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      engine === 'ai-mediapipe'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    AI Model
                  </button>
                  <button
                    onClick={() => switchEngine('edge-floodfill')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      engine === 'edge-floodfill'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    Boundary
                  </button>
                </div>
              </div>

              {/* Background Color Presets */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Select New Background Color
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

              {/* Mask Sensitivity & Edge Tuning */}
              <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-3.5">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 block flex items-center gap-1.5">
                  <Sliders size={13} className="text-purple-600" />
                  Segmentation Mask & Edge Softness Tuning
                </span>

                {engine === 'ai-mediapipe' ? (
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold">
                      <span>Body Mask Cutout Sensitivity</span>
                      <span className="font-mono font-bold text-purple-600">{(maskThreshold * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="0.8"
                      step="0.02"
                      value={maskThreshold}
                      onChange={(e) => setMaskThreshold(parseFloat(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                      <span>Tighter around hair</span>
                      <span>Broader body silhouette</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold">
                      <span>Background Color Sensitivity</span>
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
                )}

                <div>
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1 font-semibold">
                    <span>Edge Feathering & Softness</span>
                    <span className="font-mono font-bold text-purple-600">{edgeFeather}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    value={edgeFeather}
                    onChange={(e) => setEdgeFeather(parseInt(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-gray-400 block mt-0.5">
                    Smooths transition around hair, collar, and fabric edges for zero jagged artifacts.
                  </span>
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
                      className="w-36 accent-purple-600 cursor-pointer"
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
                    title="Press and hold to quickly flash the original unedited photo"
                  >
                    <Eye size={14} />
                    <span>Hold for Original</span>
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

            {/* Right Live Preview & Interactive Before-and-After Slider */}
            <div className="lg:col-span-7 flex flex-col items-center justify-center space-y-3">
              {/* Top View Mode & Presets Bar */}
              <div className="w-full flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl border border-gray-200 dark:border-slate-700 font-bold">
                  <button
                    onClick={() => setViewMode('slider')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition cursor-pointer text-xs ${
                      viewMode === 'slider'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                    }`}
                  >
                    <ChevronsLeftRight size={13} />
                    <span>Before / After Slider</span>
                  </button>
                  <button
                    onClick={() => setViewMode('result')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition cursor-pointer text-xs ${
                      viewMode === 'result'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
                    }`}
                  >
                    <Eye size={13} />
                    <span>Full Result</span>
                  </button>
                </div>

                {/* Quick Split Ratio Presets */}
                {viewMode === 'slider' && (
                  <div className="flex items-center gap-1 bg-gray-50 dark:bg-slate-800/60 p-1 rounded-xl border border-gray-200 dark:border-slate-700">
                    <button
                      onClick={() => setSliderPos(0)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                        sliderPos === 0
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-500 hover:text-purple-600 dark:hover:text-purple-300'
                      }`}
                      title="Show 100% Processed Result"
                    >
                      New BG
                    </button>
                    <button
                      onClick={() => setSliderPos(25)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                        sliderPos === 25
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-500 hover:text-purple-600 dark:hover:text-purple-300'
                      }`}
                    >
                      25%
                    </button>
                    <button
                      onClick={() => setSliderPos(50)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                        sliderPos === 50
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-500 hover:text-purple-600 dark:hover:text-purple-300'
                      }`}
                    >
                      50% Split
                    </button>
                    <button
                      onClick={() => setSliderPos(75)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                        sliderPos === 75
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-500 hover:text-purple-600 dark:hover:text-purple-300'
                      }`}
                    >
                      75%
                    </button>
                    <button
                      onClick={() => setSliderPos(100)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                        sliderPos === 100
                          ? 'bg-purple-600 text-white'
                          : 'text-gray-500 hover:text-purple-600 dark:hover:text-purple-300'
                      }`}
                      title="Show 100% Original Photo"
                    >
                      Original
                    </button>
                  </div>
                )}
              </div>

              {/* Interactive Canvas / Slider Area */}
              <div
                ref={sliderContainerRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onPointerDown={viewMode === 'slider' && activeTool === 'none' ? handleSliderPointerDown : undefined}
                onPointerMove={viewMode === 'slider' && activeTool === 'none' ? handleSliderPointerMove : undefined}
                onPointerUp={viewMode === 'slider' && activeTool === 'none' ? handleSliderPointerUp : undefined}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative w-full min-h-[340px] sm:min-h-[440px] max-h-[480px] rounded-3xl border-2 transition-all flex items-center justify-center p-4 overflow-hidden select-none touch-none ${
                  isDropDragging
                    ? 'border-purple-600 ring-4 ring-purple-500/20 bg-purple-50/50 dark:bg-purple-950/30'
                    : 'border-gray-200 dark:border-slate-700'
                } ${
                  selectedBgColor === 'transparent'
                    ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100/70 dark:bg-slate-900/90'
                    : 'bg-white dark:bg-slate-900 shadow-inner'
                } ${
                  viewMode === 'slider' && activeTool === 'none'
                    ? 'cursor-ew-resize'
                    : activeTool === 'picker'
                    ? 'cursor-crosshair'
                    : activeTool === 'restore-brush' || activeTool === 'erase-brush'
                    ? 'cursor-pointer'
                    : ''
                }`}
              >
                {(isProcessing || isAiLoading) && (
                  <div className="absolute inset-0 z-30 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs flex items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 shadow-lg text-purple-600 font-bold text-xs">
                      <RefreshCw size={15} className="animate-spin" />
                      {isAiLoading ? 'Executing AI Body Segmentation...' : 'Refining Background Composite...'}
                    </div>
                  </div>
                )}

                {/* SLIDER VIEW MODE: Split Screen with Draggable Divider */}
                {viewMode === 'slider' && activeTool === 'none' ? (
                  <div className="relative max-h-[420px] max-w-full flex items-center justify-center pointer-events-none">
                    {/* Underlying Layer: Changed Background (After) */}
                    <img
                      src={processedUrl || imageSrc!}
                      alt="Changed Background (After)"
                      className="max-h-[400px] max-w-full object-contain rounded-xl shadow-md filter drop-shadow-sm select-none"
                    />

                    {/* Overlay Layer: Original Photo (Before), clipped to slider position */}
                    <img
                      src={imageSrc!}
                      alt="Original Photo (Before)"
                      style={{
                        clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
                      }}
                      className="absolute inset-0 m-auto max-h-[400px] max-w-full object-contain rounded-xl filter drop-shadow-sm select-none"
                    />

                    {/* Draggable Divider Line & Central Handle */}
                    <div
                      className="absolute top-0 bottom-0 z-20 pointer-events-none"
                      style={{ left: `${sliderPos}%` }}
                    >
                      {/* Vertical line with shadow */}
                      <div className="w-0.5 h-full bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] -ml-[1px]" />

                      {/* Floating Handle Pill */}
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white dark:bg-slate-900 text-purple-600 shadow-2xl border-2 border-purple-600 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform ring-4 ring-purple-600/20">
                        <ChevronsLeftRight size={18} strokeWidth={2.5} />
                      </div>
                    </div>

                    {/* Left & Right Informational Badges */}
                    <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <span>Before (Original)</span>
                    </div>
                    <div className="absolute top-3 right-3 z-10 px-2.5 py-1 rounded-full bg-purple-600/90 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <span>After ({selectedBgColor === 'transparent' ? 'Cutout' : 'Changed BG'})</span>
                    </div>
                  </div>
                ) : (
                  /* SINGLE RESULT / INTERACTIVE BRUSH VIEW */
                  <div className="relative max-h-[420px] max-w-full flex items-center justify-center">
                    <img
                      src={showOriginalCompare ? imageSrc! : processedUrl || imageSrc!}
                      alt="Background Result"
                      className="max-h-[400px] max-w-full object-contain rounded-xl shadow-md transition-all duration-200 filter drop-shadow-sm pointer-events-none"
                    />
                    {showOriginalCompare && (
                      <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/75 text-white text-xs font-bold backdrop-blur-sm shadow z-20">
                        Original Unchanged Photo
                      </span>
                    )}
                  </div>
                )}

                {/* Drop feedback message */}
                {isDropDragging && (
                  <div className="absolute inset-0 z-30 bg-purple-600/20 backdrop-blur-xs flex items-center justify-center">
                    <div className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl text-purple-600 font-extrabold text-sm flex items-center gap-2 border border-purple-300">
                      <Upload size={18} />
                      Drop photo to replace immediately!
                    </div>
                  </div>
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

              {/* Slider Fine Scrubber Bar (visible when slider mode is active) */}
              {viewMode === 'slider' && activeTool === 'none' && (
                <div className="w-full flex items-center gap-3 px-3 py-2 rounded-2xl bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-xs">
                  <span className="font-bold text-gray-500 whitespace-nowrap flex items-center gap-1">
                    <SlidersHorizontal size={13} className="text-purple-600" />
                    Split:
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={sliderPos}
                    onChange={(e) => setSliderPos(parseInt(e.target.value))}
                    className="flex-1 accent-purple-600 cursor-pointer h-2 bg-gray-200 dark:bg-slate-700 rounded-lg"
                    aria-label="Before and after split slider"
                  />
                  <span className="font-mono font-bold text-purple-600 min-w-[36px] text-right">
                    {sliderPos}%
                  </span>
                </div>
              )}

              {/* Protection Guarantee Notice */}
              <div className="w-full mt-2 p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/60 flex items-start gap-3 text-xs">
                <ShieldCheck size={18} className="text-purple-600 shrink-0 mt-0.5" />
                <div className="text-purple-950 dark:text-purple-200">
                  <span className="font-extrabold block">Foreground Subject Integrity Guaranteed:</span>
                  The AI body segmentation model identifies your body silhouette (shirt, fabric, skin, face, hair, and neck) and creates a pixel-level protection mask. Even if your shirt has the exact same color as the background, your shirt remains 100% untouched while only the background is processed. Drag the Before/After slider to see the pixel-exact boundary.
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
