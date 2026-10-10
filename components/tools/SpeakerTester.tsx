import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Square,
  CheckCircle2,
  Share2,
  HelpCircle,
  Radio,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface SpeakerTesterProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const SpeakerTester: React.FC<SpeakerTesterProps> = ({ onNavigateHome, onNavigateToTool }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChannel, setActiveChannel] = useState<'both' | 'left' | 'right' | null>(null);
  const [frequency, setFrequency] = useState<number>(440); // 440Hz standard A
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const oscillatorRef = React.useRef<OscillatorNode | null>(null);
  const panNodeRef = React.useRef<StereoPannerNode | null>(null);

  const stopTone = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch {}
      oscillatorRef.current = null;
    }
    if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
    setActiveChannel(null);
  };

  const playTone = (channel: 'both' | 'left' | 'right', freq: number = frequency) => {
    stopTone();

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.15, ctx.currentTime); // Safe pleasant volume

      if (ctx.createStereoPanner) {
        const panner = ctx.createStereoPanner();
        panNodeRef.current = panner;
        // -1 = Full Left, 1 = Full Right, 0 = Center
        panner.pan.setValueAtTime(channel === 'left' ? -1 : channel === 'right' ? 1 : 0, ctx.currentTime);
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(ctx.destination);
      } else {
        osc.connect(gain);
        gain.connect(ctx.destination);
      }

      osc.start();
      oscillatorRef.current = osc;
      setIsPlaying(true);
      setActiveChannel(channel);

      // Auto stop after 4 seconds
      setTimeout(() => {
        if (oscillatorRef.current === osc) {
          stopTone();
        }
      }, 4000);
    } catch {
      toast.error('Audio playback failed in this browser');
    }
  };

  React.useEffect(() => {
    return () => stopTone();
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
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Speaker & Stereo Channel Tester</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
              Verify your left and right audio channels, headphones stereo separation, and test sound frequency playback.
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

        {/* Channels Testing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Channel Card */}
          <div
            className={`p-8 rounded-3xl border transition-all text-center space-y-4 ${
              activeChannel === 'left'
                ? 'bg-royalBlue/10 border-royalBlue ring-4 ring-royalBlue/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-royalBlue/10 dark:bg-sky-400/10 text-royalBlue dark:text-sky-400 flex items-center justify-center mx-auto">
              <Volume2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">LEFT Speaker / Earphone</h3>
            <p className="text-xs text-slate-500">Audio will only play through your left ear or left laptop speaker.</p>

            <button
              onClick={() => playTone('left')}
              className="px-6 py-3 rounded-xl bg-royalBlue text-white font-bold text-sm shadow-md hover:bg-royalBlue/90 hover:scale-105 active:scale-95 transition"
            >
              {activeChannel === 'left' ? 'Playing Left Tone...' : 'Test Left Channel (L)'}
            </button>
          </div>

          {/* Right Channel Card */}
          <div
            className={`p-8 rounded-3xl border transition-all text-center space-y-4 ${
              activeChannel === 'right'
                ? 'bg-purple-600/10 border-purple-600 ring-4 ring-purple-600/20'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center mx-auto">
              <Volume2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold">RIGHT Speaker / Earphone</h3>
            <p className="text-xs text-slate-500">Audio will only play through your right ear or right laptop speaker.</p>

            <button
              onClick={() => playTone('right')}
              className="px-6 py-3 rounded-xl bg-purple-600 text-white font-bold text-sm shadow-md hover:bg-purple-700 hover:scale-105 active:scale-95 transition"
            >
              {activeChannel === 'right' ? 'Playing Right Tone...' : 'Test Right Channel (R)'}
            </button>
          </div>
        </div>

        {/* Both Channels & Frequency Sweep */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold">Both Channels (Stereo Center)</h3>
              <p className="text-xs text-slate-500">Plays standard 440 Hz reference tone through both speakers simultaneously.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => playTone('both')}
                className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-semibold hover:opacity-90 transition shadow-sm"
              >
                Test Both Channels
              </button>
              {isPlaying && (
                <button
                  onClick={stopTone}
                  className="px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
                >
                  <Square className="w-4 h-4 fill-current inline-block mr-1" /> Stop Sound
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Suggested Tools Section */}
        <SuggestedTools
          currentToolId="speaker-tester"
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

export default SpeakerTester;
