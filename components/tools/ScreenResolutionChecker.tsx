import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Share2,
  Tv,
  CheckCircle2,
  Maximize2,
  Info,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface ScreenResolutionCheckerProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const ScreenResolutionChecker: React.FC<ScreenResolutionCheckerProps> = ({
  onNavigateHome,
  onNavigateToTool,
}) => {
  const [screenInfo, setScreenInfo] = useState({
    screenWidth: typeof window !== 'undefined' ? window.screen.width : 0,
    screenHeight: typeof window !== 'undefined' ? window.screen.height : 0,
    windowWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    windowHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    availWidth: typeof window !== 'undefined' ? window.screen.availWidth : 0,
    availHeight: typeof window !== 'undefined' ? window.screen.availHeight : 0,
    pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
    colorDepth: typeof window !== 'undefined' ? window.screen.colorDepth : 24,
    orientation: typeof window !== 'undefined' ? window.screen.orientation?.type || 'portrait' : 'landscape',
  });

  const [refreshRate, setRefreshRate] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setScreenInfo({
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        availWidth: window.screen.availWidth,
        availHeight: window.screen.availHeight,
        pixelRatio: window.devicePixelRatio || 1,
        colorDepth: window.screen.colorDepth,
        orientation: window.screen.orientation?.type || 'landscape',
      });
    };

    window.addEventListener('resize', handleResize);

    // Measure screen refresh rate using requestAnimationFrame delta
    let frameCount = 0;
    let startTime = performance.now();
    let animId: number;

    const measureHz = (now: number) => {
      frameCount++;
      const elapsed = now - startTime;
      if (elapsed >= 1000) {
        const hz = Math.round((frameCount * 1000) / elapsed);
        setRefreshRate(hz);
      } else {
        animId = requestAnimationFrame(measureHz);
      }
    };

    animId = requestAnimationFrame(measureHz);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

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
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Screen Resolution & Display Checker</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
              Inspect your exact monitor screen resolution, browser viewport size, device pixel ratio (Retina scaling), and estimated display refresh rate (Hz).
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

        {/* Hero Display Metric */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-royalBlue/10 dark:bg-sky-400/10 text-royalBlue dark:text-sky-400 flex items-center justify-center mx-auto">
            <Monitor className="w-8 h-8" />
          </div>

          <span className="text-xs uppercase font-bold tracking-widest text-slate-400">Total Monitor Resolution</span>
          <div className="text-4xl sm:text-6xl font-black font-mono text-royalBlue dark:text-sky-400">
            {screenInfo.screenWidth} × {screenInfo.screenHeight} px
          </div>
          <p className="text-sm text-slate-500">
            Rendered with {screenInfo.pixelRatio}x Device Pixel Ratio ({screenInfo.pixelRatio > 1 ? 'High DPI / Retina Display' : 'Standard 1x Display'})
          </p>
        </div>

        {/* Breakdown Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-1">
            <span className="text-xs font-bold uppercase text-slate-500">Browser Viewport</span>
            <div className="text-2xl font-bold font-mono">
              {screenInfo.windowWidth} × {screenInfo.windowHeight} px
            </div>
            <p className="text-[11px] text-slate-400">Current visible web page area</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-1">
            <span className="text-xs font-bold uppercase text-slate-500">Available Screen Space</span>
            <div className="text-2xl font-bold font-mono">
              {screenInfo.availWidth} × {screenInfo.availHeight} px
            </div>
            <p className="text-[11px] text-slate-400">Excluding OS taskbar/dock</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-1">
            <span className="text-xs font-bold uppercase text-slate-500">Estimated Refresh Rate</span>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {refreshRate ? `${refreshRate} Hz` : 'Measuring...'}
            </div>
            <p className="text-[11px] text-slate-400">Browser frame synchronization</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-1">
            <span className="text-xs font-bold uppercase text-slate-500">Color Depth</span>
            <div className="text-2xl font-bold font-mono">{screenInfo.colorDepth}-bit</div>
            <p className="text-[11px] text-slate-400">Truecolor (16.7 million colors)</p>
          </div>
        </div>

        {/* Suggested Tools Section */}
        <SuggestedTools
          currentToolId="screen-resolution-checker"
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

export default ScreenResolutionChecker;
