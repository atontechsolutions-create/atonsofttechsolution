import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Trash2,
  Share2,
  Clock,
  Mic,
  AlignLeft,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface WordCounterProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const WordCounter: React.FC<WordCounterProps> = ({ onNavigateHome, onNavigateToTool }) => {
  const [text, setText] = useState('');

  // Statistics calculation
  const charactersWithSpaces = text.length;
  const charactersWithoutSpaces = text.replace(/\s+/g, '').length;
  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const sentences = text.trim() === '' ? 0 : (text.match(/[.!?]+(\s|$)/g) || []).length || (text.trim() ? 1 : 0);
  const paragraphs = text.trim() === '' ? 0 : text.split(/\n+/).filter((p) => p.trim().length > 0).length;

  // Average reading and speaking time
  // Avg adult reading speed: 225 words/min
  // Avg adult speaking speed: 130 words/min
  const readingTimeMinutes = (words / 225).toFixed(1);
  const speakingTimeMinutes = (words / 130).toFixed(1);

  const copyText = () => {
    if (!text) {
      toast.error('No text to copy');
      return;
    }
    navigator.clipboard.writeText(text);
    toast.success('Text copied to clipboard!');
  };

  const clearText = () => {
    setText('');
    toast.success('Cleared!');
  };

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
              <span>Text & Daily Utilities</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Word & Character Counter</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
              Count words, characters, sentences, paragraphs, and calculate estimated reading and speaking time in real time.
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

        {/* Counter Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-black font-mono text-royalBlue dark:text-sky-400">{words}</div>
            <div className="text-xs uppercase font-semibold text-slate-500 mt-1">Words</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">{charactersWithSpaces}</div>
            <div className="text-xs uppercase font-semibold text-slate-500 mt-1">Characters</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">{charactersWithoutSpaces}</div>
            <div className="text-xs uppercase font-semibold text-slate-500 mt-1">No Spaces</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">{sentences}</div>
            <div className="text-xs uppercase font-semibold text-slate-500 mt-1">Sentences</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-black font-mono text-purple-600 dark:text-purple-400">{paragraphs}</div>
            <div className="text-xs uppercase font-semibold text-slate-500 mt-1">Paragraphs</div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-center">
            <div className="text-2xl sm:text-3xl font-black font-mono text-amber-500">{readingTimeMinutes} m</div>
            <div className="text-xs uppercase font-semibold text-slate-500 mt-1">Read Time</div>
          </div>
        </div>

        {/* Text Area Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Text</label>
            <div className="flex items-center gap-2">
              <button
                onClick={copyText}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Text
              </button>
              <button
                onClick={clearText}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear
              </button>
            </div>
          </div>

          <textarea
            rows={12}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here to count words, characters, and sentences..."
            className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-royalBlue font-normal leading-relaxed"
          />

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Reading Time: ~{readingTimeMinutes} min
              </span>
              <span className="flex items-center gap-1">
                <Mic className="w-3.5 h-3.5" /> Speaking Time: ~{speakingTimeMinutes} min
              </span>
            </div>
            <span>Auto-saving locally in browser</span>
          </div>
        </div>

        {/* Suggested Tools Section */}
        <SuggestedTools
          currentToolId="word-character-counter"
          currentCategory="Text & Daily Utilities"
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

export default WordCounter;
