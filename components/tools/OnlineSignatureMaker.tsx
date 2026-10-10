import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  Type,
  Download,
  Trash2,
  Undo2,
  Redo2,
  Eraser,
  Copy,
  Check,
  RotateCw,
  Sparkles,
  Sliders,
  Maximize2,
  CheckCircle2,
  Layers,
  Palette,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface SignatureStylePreset {
  id: string;
  name: string;
  fontFamily: string;
  sampleName: string;
}

const SIGNATURE_FONTS: SignatureStylePreset[] = [
  { id: 'dancing-script', name: 'Dancing Script (Fluid)', fontFamily: "'Dancing Script', cursive", sampleName: 'John Doe' },
  { id: 'great-vibes', name: 'Great Vibes (Calligraphy)', fontFamily: "'Great Vibes', cursive", sampleName: 'John Doe' },
  { id: 'pacifico', name: 'Pacifico (Modern Bold)', fontFamily: "'Pacifico', cursive", sampleName: 'John Doe' },
  { id: 'sacramento', name: 'Sacramento (Delicate)', fontFamily: "'Sacramento', cursive", sampleName: 'John Doe' },
  { id: 'caveat', name: 'Caveat (Casual Natural)', fontFamily: "'Caveat', cursive", sampleName: 'John Doe' },
  { id: 'allura', name: 'Allura (Executive Script)', fontFamily: "'Allura', cursive", sampleName: 'John Doe' },
  { id: 'satisfy', name: 'Satisfy (Smooth Signature)', fontFamily: "'Satisfy', cursive", sampleName: 'John Doe' },
  { id: 'alex-brush', name: 'Alex Brush (Classic Formal)', fontFamily: "'Alex Brush', cursive", sampleName: 'John Doe' },
];

interface OnlineSignatureMakerProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

interface Point {
  x: number;
  y: number;
  width?: number;
}

const OnlineSignatureMaker: React.FC<OnlineSignatureMakerProps> = ({
  onNavigateHome,
  onNavigateToTool,
}) => {
  const [mode, setMode] = useState<'draw' | 'type'>('draw');

  // Draw Mode States
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [penColor, setPenColor] = useState<string>('#0A0A0A'); // Black default
  const [penWidth, setPenWidth] = useState<number>(3); // 1 to 8
  const [penStyle, setPenStyle] = useState<'fountain' | 'ballpoint' | 'marker'>('fountain');
  const [isEraser, setIsEraser] = useState<boolean>(false);

  // History for Undo/Redo
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState<number>(-1);

  // Type Mode States
  const [typedName, setTypedName] = useState<string>('Your Name');
  const [selectedFont, setSelectedFont] = useState<string>(SIGNATURE_FONTS[0].fontFamily);
  const [fontSize, setFontSize] = useState<number>(64);
  const [slant, setSlant] = useState<number>(-6); // degrees
  const [textColor, setTextColor] = useState<string>('#0A0A0A');

  // Common Canvas Settings
  const [bgMode, setBgMode] = useState<'transparent' | 'white'>('transparent');
  const [canvasWidth, setCanvasWidth] = useState<number>(600);
  const [canvasHeight, setCanvasHeight] = useState<number>(240);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Points buffer for smooth quadratic curves
  const pointsRef = useRef<Point[]>([]);

  // Initialize Canvas
  useEffect(() => {
    initCanvas();
  }, [canvasWidth, canvasHeight, bgMode]);

  // Redraw when Type mode settings change
  useEffect(() => {
    if (mode === 'type') {
      renderTypedSignature();
    }
  }, [mode, typedName, selectedFont, fontSize, slant, textColor, bgMode, canvasWidth, canvasHeight]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgMode === 'white') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (mode === 'draw') {
      saveState();
    }
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(data);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prevStep = historyStep - 1;
    ctx.putImageData(history[prevStep], 0, 0);
    setHistoryStep(prevStep);
  };

  const redo = () => {
    if (historyStep >= history.length - 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const nextStep = historyStep + 1;
    ctx.putImageData(history[nextStep], 0, 0);
    setHistoryStep(nextStep);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgMode === 'white') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    saveState();
    toast.success('Canvas cleared.');
  };

  // Drawing Handlers
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (mode !== 'draw') return;
    e.preventDefault();
    setIsDrawing(true);
    const p = getCanvasCoords(e);
    pointsRef.current = [p];

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? (bgMode === 'white' ? '#FFFFFF' : 'rgba(0,0,0,1)') : penColor;
    ctx.lineWidth = isEraser ? penWidth * 3 : penWidth;

    if (isEraser && bgMode === 'transparent') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || mode !== 'draw') return;
    e.preventDefault();
    const p = getCanvasCoords(e);
    pointsRef.current.push(p);

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const points = pointsRef.current;
    if (points.length < 3) {
      const b = points[0];
      ctx.beginPath();
      ctx.arc(b.x, b.y, ctx.lineWidth / 2, 0, Math.PI * 2, !0);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.fill();
      ctx.closePath();
      return;
    }

    // Smooth Bezier Curve through middle of points
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 2; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }

    const n = points.length - 2;
    ctx.quadraticCurveTo(points[n].x, points[n].y, points[n + 1].x, points[n + 1].y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    pointsRef.current = [];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.globalCompositeOperation = 'source-over';
    }
    saveState();
  };

  // Type Mode Rendering
  const renderTypedSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (bgMode === 'white') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.save();
    ctx.fillStyle = textColor;
    ctx.font = `${fontSize}px ${selectedFont}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Apply Slant transformation
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.transform(1, 0, Math.tan((slant * Math.PI) / 180), 1, 0, 0);

    ctx.fillText(typedName || 'Your Name', 0, 0);
    ctx.restore();
  };

  // Download Output
  const handleDownload = (format: 'png' | 'jpg') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let exportCanvas = canvas;

    // For JPG with transparent mode, fill white background on copy
    if (format === 'jpg' && bgMode === 'transparent') {
      const temp = document.createElement('canvas');
      temp.width = canvas.width;
      temp.height = canvas.height;
      const tCtx = temp.getContext('2d');
      if (tCtx) {
        tCtx.fillStyle = '#FFFFFF';
        tCtx.fillRect(0, 0, temp.width, temp.height);
        tCtx.drawImage(canvas, 0, 0);
        exportCanvas = temp;
      }
    }

    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    exportCanvas.toBlob(
      (blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `signature-${Date.now()}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success(`Signature downloaded as ${format.toUpperCase()}!`);
      },
      mime,
      0.95
    );
  };

  // Copy to Clipboard
  const handleCopyToClipboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        if (navigator.clipboard && window.ClipboardItem) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
          toast.success('Signature copied to clipboard!');
        } else {
          toast.error('Direct image copy not supported in this browser. Please use download.');
        }
      }, 'image/png');
    } catch (err) {
      console.error(err);
      toast.error('Failed to copy signature image.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-5xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800 mb-3">
          <Sparkles size={14} />
          <span>Professional Digital Signature Studio</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Online <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Signature Maker</span>
        </h1>
        <p className="mt-3 text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Draw your handwritten e-signature with realistic fountain ink or generate elegant cursive calligraphy signatures. Download in transparent PNG or pure white JPG.
        </p>
      </div>

      <AdSenseUnit placementLabel="Online Signature Maker Top" />

      {/* Main Container */}
      <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden">
        {/* Top Mode Tabs */}
        <div className="border-b border-gray-200 dark:border-slate-800 p-4 sm:p-6 bg-gray-50/50 dark:bg-slate-900/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-gray-200/80 dark:bg-slate-800">
            <button
              onClick={() => setMode('draw')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                mode === 'draw'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              <PenTool size={16} />
              <span>Draw Handwritten Signature</span>
            </button>
            <button
              onClick={() => setMode('type')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition cursor-pointer ${
                mode === 'type'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              <Type size={16} />
              <span>Type Signature (Cursive Fonts)</span>
            </button>
          </div>

          {/* Canvas Dimension Presets */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-gray-500">Preset Size:</span>
            <button
              onClick={() => {
                setCanvasWidth(140 * 3);
                setCanvasHeight(60 * 3);
              }}
              className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 font-semibold"
              title="Official 140x60 Indian Exam Ratio"
            >
              140x60 (Exam)
            </button>
            <button
              onClick={() => {
                setCanvasWidth(600);
                setCanvasHeight(240);
              }}
              className="px-2.5 py-1 rounded-lg border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 font-semibold"
              title="Standard Document Ratio"
            >
              Standard (600x240)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8">
          {/* Controls Column */}
          <div className="lg:col-span-5 space-y-5">
            {mode === 'draw' ? (
              <>
                {/* Ink Color Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Ink Color
                  </label>
                  <div className="flex items-center gap-2">
                    {[
                      { name: 'Black', hex: '#0A0A0A' },
                      { name: 'Royal Blue', hex: '#0047AB' },
                      { name: 'Navy Blue', hex: '#001F3F' },
                      { name: 'Dark Red', hex: '#8B0000' },
                      { name: 'Forest Green', hex: '#1B4D3E' },
                    ].map((c) => (
                      <button
                        key={c.hex}
                        onClick={() => {
                          setPenColor(c.hex);
                          setIsEraser(false);
                        }}
                        className={`w-9 h-9 rounded-xl border-2 transition transform hover:scale-110 cursor-pointer flex items-center justify-center ${
                          penColor === c.hex && !isEraser
                            ? 'border-blue-600 ring-2 ring-blue-500/30'
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c.hex }}
                        title={c.name}
                      >
                        {penColor === c.hex && !isEraser && <Check size={16} className="text-white" />}
                      </button>
                    ))}
                    <input
                      type="color"
                      value={penColor}
                      onChange={(e) => {
                        setPenColor(e.target.value);
                        setIsEraser(false);
                      }}
                      className="w-9 h-9 rounded-xl border-0 cursor-pointer bg-transparent"
                      title="Custom Ink Color"
                    />
                  </div>
                </div>

                {/* Pen Thickness & Tools */}
                <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-3">
                  <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 font-semibold">
                    <span>Pen Stroke Thickness</span>
                    <span className="font-mono text-blue-600 font-bold">{penWidth}px</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={penWidth}
                    onChange={(e) => setPenWidth(parseInt(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />

                  {/* Draw Toolbar: Eraser, Undo, Redo, Clear */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200 dark:border-slate-700">
                    <button
                      onClick={() => setIsEraser(!isEraser)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        isEraser
                          ? 'bg-amber-600 text-white'
                          : 'bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Eraser size={14} />
                      <span>{isEraser ? 'Eraser Active' : 'Eraser'}</span>
                    </button>
                    <button
                      onClick={undo}
                      disabled={historyStep <= 0}
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 disabled:opacity-30 cursor-pointer"
                      title="Undo Stroke"
                    >
                      <Undo2 size={15} />
                    </button>
                    <button
                      onClick={redo}
                      disabled={historyStep >= history.length - 1}
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 disabled:opacity-30 cursor-pointer"
                      title="Redo Stroke"
                    >
                      <Redo2 size={15} />
                    </button>
                    <button
                      onClick={clearCanvas}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 ml-auto cursor-pointer"
                    >
                      <Trash2 size={14} />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Type Mode Controls */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Enter Name or Initials
                  </label>
                  <input
                    type="text"
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="e.g. John Doe or J. Doe"
                    maxLength={40}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-base font-semibold focus:ring-2 focus:ring-blue-500 outline-none shadow-xs"
                  />
                </div>

                {/* Font Preset List */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Choose Cursive Style ({SIGNATURE_FONTS.length} Fonts)
                  </label>
                  <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                    {SIGNATURE_FONTS.map((font) => (
                      <button
                        key={font.id}
                        onClick={() => setSelectedFont(font.fontFamily)}
                        className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                          selectedFont === font.fontFamily
                            ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-500'
                            : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 bg-white dark:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="text-[11px] font-bold text-gray-400">{font.name}</div>
                          <div
                            className="text-lg text-gray-900 dark:text-white"
                            style={{ fontFamily: font.fontFamily }}
                          >
                            {typedName || 'Your Signature'}
                          </div>
                        </div>
                        {selectedFont === font.fontFamily && (
                          <Check size={16} className="text-blue-600 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Typography Sliders */}
                <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 font-semibold mb-1">
                      <span>Font Size</span>
                      <span className="font-mono text-blue-600 font-bold">{fontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="36"
                      max="110"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 font-semibold mb-1">
                      <span>Signature Slant (Angle)</span>
                      <span className="font-mono text-blue-600 font-bold">{slant}°</span>
                    </div>
                    <input
                      type="range"
                      min="-25"
                      max="20"
                      value={slant}
                      onChange={(e) => setSlant(parseInt(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Output Background Setting */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                Output Background
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setBgMode('transparent')}
                  className={`p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                    bgMode === 'transparent'
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 shadow-xs'
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="font-extrabold text-xs">Transparent PNG</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Zero background</div>
                </button>
                <button
                  onClick={() => setBgMode('white')}
                  className={`p-3 rounded-xl border-2 text-left transition cursor-pointer ${
                    bgMode === 'white'
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/30 text-blue-900 dark:text-blue-100 shadow-xs'
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="font-extrabold text-xs">Pure White JPG</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Exam & official form</div>
                </button>
              </div>
            </div>

            {/* Download and Copy Actions */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleDownload('png')}
                  className="py-3 px-3 rounded-2xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer"
                >
                  <Download size={16} />
                  <span>Download PNG</span>
                </button>
                <button
                  onClick={() => handleDownload('jpg')}
                  className="py-3 px-3 rounded-2xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md flex items-center justify-center gap-1.5 text-xs sm:text-sm cursor-pointer"
                >
                  <Download size={16} />
                  <span>Download JPG</span>
                </button>
              </div>

              <button
                onClick={handleCopyToClipboard}
                className="w-full py-2.5 px-4 rounded-xl border border-gray-300 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-bold text-gray-700 dark:text-gray-200 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isCopied ? <Check size={15} className="text-emerald-500" /> : <Copy size={15} />}
                <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Image to Clipboard'}</span>
              </button>
            </div>
          </div>

          {/* Canvas Display Column */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-between mb-2 text-xs">
              <span className="font-extrabold text-gray-700 dark:text-gray-300">
                {mode === 'draw' ? '✍️ Draw Your Signature Below' : '✨ Generated Cursive Signature'}
              </span>
              <span className="text-gray-400 text-[11px]">
                {canvasWidth} x {canvasHeight} px • {bgMode === 'transparent' ? 'Transparent' : 'White'}
              </span>
            </div>

            {/* Canvas Container */}
            <div
              className={`relative w-full rounded-3xl border-2 border-gray-300 dark:border-slate-700 p-4 flex items-center justify-center overflow-hidden transition-all shadow-inner ${
                bgMode === 'transparent'
                  ? 'bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] bg-slate-100/70 dark:bg-slate-900/90'
                  : 'bg-white'
              }`}
            >
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className={`max-w-full h-auto cursor-crosshair rounded-xl touch-none ${
                  mode === 'draw' ? 'hover:shadow-sm' : ''
                }`}
                style={{
                  maxHeight: '340px',
                }}
              />

              {mode === 'draw' && historyStep <= 0 && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm font-semibold italic">
                  Click or touch to sign here...
                </div>
              )}
            </div>

            {/* Guidelines Card */}
            <div className="w-full mt-4 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-950 dark:text-blue-200 flex items-start gap-3">
              <Sparkles size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">100% Free & Legal E-Signature:</span>
                Use this transparent signature for PDF contracts, digital document signing, email signatures, job application forms, and official government exam uploads.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto mt-12">
        <SuggestedTools
          currentToolId="online-signature-maker"
          onNavigate={onNavigateHome}
          onNavigateToTool={onNavigateToTool}
        />
      </div>
    </div>
  );
};

export default OnlineSignatureMaker;
