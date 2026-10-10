import React, { useState } from 'react';
import {
  Tv,
  Share2,
  Maximize,
  Minimize,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface DeadPixelTesterProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const COLORS = [
  { name: 'Pure Red', hex: '#FF0000', label: 'Test Red Subpixels' },
  { name: 'Pure Green', hex: '#00FF00', label: 'Test Green Subpixels' },
  { name: 'Pure Blue', hex: '#0000FF', label: 'Test Blue Subpixels' },
  { name: 'Solid White', hex: '#FFFFFF', label: 'Test Dead Pixels (Black Spots)' },
  { name: 'Solid Black', hex: '#000000', label: 'Test Stuck Pixels (Bright Spots)' },
  { name: 'Warm Yellow', hex: '#FFFF00', label: 'Secondary Channel Test' },
  { name: 'Magenta', hex: '#FF00FF', label: 'Secondary Channel Test' },
  { name: 'Cyan', hex: '#00FFFF', label: 'Secondary Channel Test' },
];

const DeadPixelTester: React.FC<DeadPixelTesterProps> = ({ onNavigateHome, onNavigateToTool }) => {
  const [activeColorIndex, setActiveColorIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const startFullScreenTest = (startIndex: number = 0) => {
    setActiveColorIndex(startIndex);
    setIsFullScreen(true);

    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(() => {});
    }
  };

  const exitFullScreen = () => {
    setIsFullScreen(false);
    if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const nextColor = () => {
    setActiveColorIndex((prev) => (prev + 1) % COLORS.length);
  };

  const prevColor = () => {
    setActiveColorIndex((prev) => (prev - 1 + COLORS.length) % COLORS.length);
  };

  if (isFullScreen) {
    const currentColor = COLORS[activeColorIndex];
    return (
      <div
        onClick={nextColor}
        className="fixed inset-0 z-50 flex flex-col justify-between p-6 cursor-pointer select-none"
        style={{ backgroundColor: currentColor.hex }}
      >
        <div className="flex items-center justify-between">
          <span
            className="px-3 py-1.5 rounded-lg text-xs font-bold font-mono shadow-md backdrop-blur-md"
            style={{
              backgroundColor: currentColor.hex === '#FFFFFF' ? '#000000' : '#FFFFFF',
              color: currentColor.hex === '#FFFFFF' ? '#FFFFFF' : '#000000',
            }}
          >
            {currentColor.name} ({activeColorIndex + 1}/{COLORS.length}) — Click anywhere to switch
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              exitFullScreen();
            }}
            className="px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition active:scale-95"
            style={{
              backgroundColor: currentColor.hex === '#000000' ? '#FFFFFF' : '#000000',
              color: currentColor.hex === '#000000' ? '#000000' : '#FFFFFF',
            }}
          >
            Exit Fullscreen (ESC)
          </button>
        </div>

        <div className="text-center">
          <p
            className="text-xs font-medium opacity-60 inline-block px-3 py-1 rounded"
            style={{
              color: currentColor.hex === '#FFFFFF' ? '#000' : '#fff',
            }}
          >
            Inspect screen closely for any non-matching colored tiny dots. Click or press right arrow to continue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Top Ad Banner */}
      <div className="max-w-5xl mx-auto mb-6">
        <AdSenseUnit format="horizontal" />
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Breadcrumbs & Title */}
        <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-royalBlue dark:text-sky-400 mb-1">
              <button
                onClick={() => onNavigateToTool?.('/tools')}
                className="hover:underline flex items-center gap-1 text-slate-500 dark:text-slate-400"
              >
                Tools
              </button>
              <span>/</span>
              <span>Device Testers</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Dead & Stuck Pixel Screen Tester</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
              Inspect your monitor, laptop, or smartphone display for dead, stuck, or defective subpixels using primary solid colors.
            </p>
          </div>
          <div className="flex items-center gap-2 self-center sm:self-auto">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Tool link copied to clipboard!');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
            >
              <Share2 className="w-3.5 h-3.5" /> Share Tool
            </button>
          </div>
        </div>

        {/* Start Fullscreen Hero Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-royalBlue/10 dark:bg-sky-400/10 text-royalBlue dark:text-sky-400 flex items-center justify-center mx-auto">
            <Tv className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold">Start Full-Screen Diagnostic Test</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            This will switch your entire monitor into solid color palettes. Clean your display glass with a cloth first to avoid mistaking dust for a dead pixel.
          </p>

          <button
            onClick={() => startFullScreenTest(0)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-royalBlue text-white font-bold text-base shadow-lg hover:bg-royalBlue/90 hover:scale-105 active:scale-95 transition"
          >
            <Maximize className="w-5 h-5" /> Launch Fullscreen Test
          </button>
        </div>

        {/* Color Palette Grid */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Or Test Individual Color Palettes:
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {COLORS.map((c, idx) => (
              <button
                key={c.name}
                onClick={() => startFullScreenTest(idx)}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-royalBlue text-left transition group shadow-sm flex items-center gap-3"
              >
                <div
                  className="w-10 h-10 rounded-xl border border-black/10 flex-shrink-0 shadow-inner"
                  style={{ backgroundColor: c.hex }}
                />
                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-royalBlue transition">
                    {c.name}
                  </h4>
                  <p className="text-[11px] text-slate-500">{c.label}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Suggested Tools Section */}
        <SuggestedTools
          currentToolId="dead-pixel-test"
          currentCategory="Device Testers"
          onNavigateToTool={onNavigateToTool}
        />

        {/* Bottom Ad Unit */}
        <div className="pt-4">
          <AdSenseUnit format="horizontal" />
        </div>
      </div>
    </div>
  );
};

export default DeadPixelTester;
