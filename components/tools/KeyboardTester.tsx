import React, { useState, useEffect, useRef } from 'react';
import {
  Keyboard,
  RotateCcw,
  CheckCircle2,
  Share2,
  Volume2,
  VolumeX,
  Laptop,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface KeyboardTesterProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

// Full standard keyboard layout definition
const KEYBOARD_LAYOUT = [
  // Row 0: Function Keys
  [
    { code: 'Escape', label: 'Esc', width: 'w-10 sm:w-12' },
    { code: 'F1', label: 'F1' },
    { code: 'F2', label: 'F2' },
    { code: 'F3', label: 'F3' },
    { code: 'F4', label: 'F4' },
    { code: 'F5', label: 'F5' },
    { code: 'F6', label: 'F6' },
    { code: 'F7', label: 'F7' },
    { code: 'F8', label: 'F8' },
    { code: 'F9', label: 'F9' },
    { code: 'F10', label: 'F10' },
    { code: 'F11', label: 'F11' },
    { code: 'F12', label: 'F12' },
  ],
  // Row 1: Numbers
  [
    { code: 'Backquote', label: '` ~' },
    { code: 'Digit1', label: '1 !' },
    { code: 'Digit2', label: '2 @' },
    { code: 'Digit3', label: '3 #' },
    { code: 'Digit4', label: '4 $' },
    { code: 'Digit5', label: '5 %' },
    { code: 'Digit6', label: '6 ^' },
    { code: 'Digit7', label: '7 &' },
    { code: 'Digit8', label: '8 *' },
    { code: 'Digit9', label: '9 (' },
    { code: 'Digit0', label: '0 )' },
    { code: 'Minus', label: '- _' },
    { code: 'Equal', label: '= +' },
    { code: 'Backspace', label: 'Backspace', width: 'flex-1 min-w-[60px] sm:min-w-[80px]' },
  ],
  // Row 2: QWERTY
  [
    { code: 'Tab', label: 'Tab', width: 'w-12 sm:w-16' },
    { code: 'KeyQ', label: 'Q' },
    { code: 'KeyW', label: 'W' },
    { code: 'KeyE', label: 'E' },
    { code: 'KeyR', label: 'R' },
    { code: 'KeyT', label: 'T' },
    { code: 'KeyY', label: 'Y' },
    { code: 'KeyU', label: 'U' },
    { code: 'KeyI', label: 'I' },
    { code: 'KeyO', label: 'O' },
    { code: 'KeyP', label: 'P' },
    { code: 'BracketLeft', label: '[ {' },
    { code: 'BracketRight', label: '] }' },
    { code: 'Backslash', label: '\\ |', width: 'w-12 sm:w-16' },
  ],
  // Row 3: ASDF
  [
    { code: 'CapsLock', label: 'Caps', width: 'w-14 sm:w-20' },
    { code: 'KeyA', label: 'A' },
    { code: 'KeyS', label: 'S' },
    { code: 'KeyD', label: 'D' },
    { code: 'KeyF', label: 'F' },
    { code: 'KeyG', label: 'G' },
    { code: 'KeyH', label: 'H' },
    { code: 'KeyJ', label: 'J' },
    { code: 'KeyK', label: 'K' },
    { code: 'KeyL', label: 'L' },
    { code: 'Semicolon', label: '; :' },
    { code: 'Quote', label: '\' "' },
    { code: 'Enter', label: 'Enter', width: 'flex-1 min-w-[60px] sm:min-w-[84px]' },
  ],
  // Row 4: ZXCV
  [
    { code: 'ShiftLeft', label: 'Shift', width: 'w-16 sm:w-24' },
    { code: 'KeyZ', label: 'Z' },
    { code: 'KeyX', label: 'X' },
    { code: 'KeyC', label: 'C' },
    { code: 'KeyV', label: 'V' },
    { code: 'KeyB', label: 'B' },
    { code: 'KeyN', label: 'N' },
    { code: 'KeyM', label: 'M' },
    { code: 'Comma', label: ', <' },
    { code: 'Period', label: '. >' },
    { code: 'Slash', label: '/ ?' },
    { code: 'ShiftRight', label: 'Shift', width: 'flex-1 min-w-[60px] sm:min-w-[96px]' },
  ],
  // Row 5: Modifiers & Space
  [
    { code: 'ControlLeft', label: 'Ctrl', width: 'w-12 sm:w-16' },
    { code: 'MetaLeft', label: 'Win/Cmd', width: 'w-12 sm:w-14' },
    { code: 'AltLeft', label: 'Alt', width: 'w-12 sm:w-14' },
    { code: 'Space', label: 'Spacebar', width: 'flex-1 min-w-[120px] sm:min-w-[240px]' },
    { code: 'AltRight', label: 'Alt', width: 'w-12 sm:w-14' },
    { code: 'MetaRight', label: 'Win/Cmd', width: 'w-12 sm:w-14' },
    { code: 'ContextMenu', label: 'Menu', width: 'w-10 sm:w-12' },
    { code: 'ControlRight', label: 'Ctrl', width: 'w-12 sm:w-16' },
  ],
];

const NAV_CLUSTER = [
  [
    { code: 'PrintScreen', label: 'PrtSc' },
    { code: 'ScrollLock', label: 'ScrLk' },
    { code: 'Pause', label: 'Pause' },
  ],
  [
    { code: 'Insert', label: 'Ins' },
    { code: 'Home', label: 'Home' },
    { code: 'PageUp', label: 'PgUp' },
  ],
  [
    { code: 'Delete', label: 'Del' },
    { code: 'End', label: 'End' },
    { code: 'PageDown', label: 'PgDn' },
  ],
];

const ARROW_KEYS = [
  { code: 'ArrowUp', label: '↑', row: 0, col: 1 },
  { code: 'ArrowLeft', label: '←', row: 1, col: 0 },
  { code: 'ArrowDown', label: '↓', row: 1, col: 1 },
  { code: 'ArrowRight', label: '→', row: 1, col: 2 },
];

const KeyboardTester: React.FC<KeyboardTesterProps> = ({ onNavigateToTool }) => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
  const [lastKeyPressed, setLastKeyPressed] = useState<{ key: string; code: string; which: number } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [keyPressCount, setKeyPressCount] = useState(0);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Play subtle mechanical keyclick tone
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Audio optional
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser default actions like space scrolling, Tab shifting focus away, F1 help
      if (
        ['Tab', 'Space', 'F1', 'F3', 'F5', 'F6', 'F7', 'F12', 'ArrowUp', 'ArrowDown', 'Backspace'].includes(e.code)
      ) {
        e.preventDefault();
      }

      setPressedKeys((prev) => {
        const next = new Set(prev);
        next.add(e.code);
        return next;
      });

      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.add(e.code);
        return next;
      });

      setLastKeyPressed({
        key: e.key,
        code: e.code,
        which: e.keyCode || e.which,
      });

      setKeyPressCount((c) => c + 1);
      playClickSound();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      setActiveKeys((prev) => {
        const next = new Set(prev);
        next.delete(e.code);
        return next;
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [soundEnabled]);

  const resetTest = () => {
    setPressedKeys(new Set());
    setActiveKeys(new Set());
    setLastKeyPressed(null);
    setKeyPressCount(0);
    toast.success('Keyboard test reset! Press any keys to test.');
  };

  const totalCatalogKeys = 83;
  const testedCount = pressedKeys.size;
  const percentTested = Math.min(100, Math.round((testedCount / totalCatalogKeys) * 100));

  const getKeyClass = (code: string) => {
    const isCurrentlyActive = activeKeys.has(code);
    const hasBeenTested = pressedKeys.has(code);

    if (isCurrentlyActive) {
      return 'bg-royalBlue text-white scale-95 shadow-inner ring-2 ring-blue-300 font-bold';
    }
    if (hasBeenTested) {
      return 'bg-emerald-500 text-white font-bold shadow-sm border-emerald-600';
    }
    return 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <AdSenseUnit format="horizontal" />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Breadcrumbs & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-royalBlue dark:text-sky-400 mb-1">
              <button
                onClick={() => onNavigateToTool?.('/tools')}
                className="hover:underline flex items-center gap-1 text-slate-500 dark:text-slate-400"
              >
                Tools
              </button>
              <span>/</span>
              <span>Hardware Testers</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Online Keyboard Tester</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
              Test every key on your laptop or external keyboard. Keys light up in green upon successful detection to test sticky, ghosting, or non-working keys.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 transition cursor-pointer"
              title="Toggle mechanical keyclick sound"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-royalBlue" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
              {soundEnabled ? 'Sound On' : 'Sound Muted'}
            </button>
            <button
              onClick={resetTest}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Tool link copied to clipboard!');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-royalBlue text-white hover:bg-royalBlue/90 transition shadow-sm cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
          </div>
        </div>

        {/* Live Key Status Dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Last Key Pressed</span>
            <span className="text-xl sm:text-2xl font-black font-mono text-royalBlue dark:text-sky-400">
              {lastKeyPressed ? lastKeyPressed.key.toUpperCase() : 'None'}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Key Code (JS)</span>
            <span className="text-base sm:text-lg font-mono font-bold text-slate-700 dark:text-slate-200">
              {lastKeyPressed ? `${lastKeyPressed.code} (${lastKeyPressed.which})` : '—'}
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Keys Verified</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {testedCount} / {totalCatalogKeys} ({percentTested}%)
            </span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Total Keystrokes</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {keyPressCount}
            </span>
          </div>
        </div>

        {/* Interactive Virtual Keyboard */}
        <div className="bg-slate-900 text-white rounded-3xl p-4 sm:p-7 shadow-xl border border-slate-800 space-y-6 overflow-x-auto">
          <div className="min-w-[760px] space-y-4">
            <div className="flex items-start gap-4">
              {/* Main Keyboard Grid */}
              <div className="flex-1 space-y-2">
                {KEYBOARD_LAYOUT.map((row, rIdx) => (
                  <div key={rIdx} className="flex gap-1.5 sm:gap-2">
                    {row.map((k) => (
                      <div
                        key={k.code}
                        className={`h-10 sm:h-12 border rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm select-none transition-all duration-75 text-center px-1 font-mono ${
                          k.width || 'w-10 sm:w-12'
                        } ${getKeyClass(k.code)}`}
                      >
                        {k.label}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Navigation Cluster (Ins/Home/PgUp + Arrows) */}
              <div className="w-36 space-y-6">
                {/* 3x3 Nav keys */}
                <div className="space-y-2">
                  {NAV_CLUSTER.map((row, rIdx) => (
                    <div key={rIdx} className="flex gap-1.5">
                      {row.map((k) => (
                        <div
                          key={k.code}
                          className={`w-10 sm:w-11 h-10 sm:h-12 border rounded-lg sm:rounded-xl flex items-center justify-center text-[10px] sm:text-xs select-none transition-all duration-75 text-center font-mono ${getKeyClass(
                            k.code
                          )}`}
                        >
                          {k.label}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Arrow Keys Inverted T */}
                <div className="pt-2">
                  <div className="flex justify-center mb-1.5">
                    <div
                      className={`w-10 sm:w-11 h-10 sm:h-12 border rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm select-none transition-all duration-75 text-center font-mono ${getKeyClass(
                        'ArrowUp'
                      )}`}
                    >
                      ↑
                    </div>
                  </div>
                  <div className="flex gap-1.5 justify-center">
                    {['ArrowLeft', 'ArrowDown', 'ArrowRight'].map((code) => (
                      <div
                        key={code}
                        className={`w-10 sm:w-11 h-10 sm:h-12 border rounded-lg sm:rounded-xl flex items-center justify-center text-xs sm:text-sm select-none transition-all duration-75 text-center font-mono ${getKeyClass(
                          code
                        )}`}
                      >
                        {code === 'ArrowLeft' ? '←' : code === 'ArrowDown' ? '↓' : '→'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex items-center justify-between flex-wrap gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-slate-700 border border-slate-600"></span> Untested
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-royalBlue"></span> Currently Holding
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Passed & Working
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400">
              <Laptop className="w-4 h-4 text-royalBlue" />
              <span>Full support for Windows, Mac, Linux & Chromebooks</span>
            </div>
          </div>
        </div>

        {/* Instructions & Diagnostics */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" /> How to use Keyboard Tester
          </h3>
          <ul className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
            <li>Press every key on your physical keyboard. The corresponding key will turn <strong>green</strong> once detected.</li>
            <li>Press multiple keys simultaneously (e.g. <code>W + A + Shift</code>) to test <strong>N-Key Rollover (NKRO)</strong> and key ghosting for gaming keyboards.</li>
            <li>Special keys like CapsLock, Windows/Cmd, and Shift are fully supported.</li>
            <li>No installation or plugins required — runs 100% locally in your browser.</li>
          </ul>
        </div>

        <SuggestedTools
          currentToolId="keyboard-tester"
          currentCategory="Device Testers"
          onNavigateToTool={onNavigateToTool}
        />

        <AdSenseUnit format="horizontal" />
      </div>
    </div>
  );
};

export default KeyboardTester;
