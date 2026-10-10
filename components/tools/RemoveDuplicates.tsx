import React, { useState } from 'react';
import {
  Sliders,
  Copy,
  Trash2,
  Share2,
  ArrowUpDown,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface RemoveDuplicatesProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const RemoveDuplicates: React.FC<RemoveDuplicatesProps> = ({ onNavigateHome, onNavigateToTool }) => {
  const [inputText, setInputText] = useState(
    'apple\nbanana\norange\napple\ngrapes\nbanana\nwatermelon'
  );
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [trimWhitespace, setTrimWhitespace] = useState(true);

  const removeDuplicates = () => {
    let lines = inputText.split('\n');
    if (trimWhitespace) {
      lines = lines.map((l) => l.trim()).filter((l) => l.length > 0);
    }

    const seen = new Set<string>();
    const uniqueLines: string[] = [];

    lines.forEach((line) => {
      const key = caseSensitive ? line : line.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        uniqueLines.push(line);
      }
    });

    const removedCount = lines.length - uniqueLines.length;
    setInputText(uniqueLines.join('\n'));
    toast.success(`Removed ${removedCount} duplicate line(s)!`);
  };

  const sortAlphabetical = (direction: 'asc' | 'desc') => {
    let lines = inputText.split('\n');
    if (trimWhitespace) lines = lines.map((l) => l.trim()).filter((l) => l.length > 0);

    lines.sort((a, b) => (direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a)));
    setInputText(lines.join('\n'));
    toast.success(`Sorted lines ${direction === 'asc' ? 'A to Z' : 'Z to A'}!`);
  };

  const removeEmptyLines = () => {
    const lines = inputText.split('\n').filter((l) => l.trim().length > 0);
    setInputText(lines.join('\n'));
    toast.success('Empty blank lines removed!');
  };

  const copyText = () => {
    if (!inputText) return;
    navigator.clipboard.writeText(inputText);
    toast.success('Cleaned lines copied to clipboard!');
  };

  const lineCount = inputText ? inputText.split('\n').length : 0;

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
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Remove Duplicate Lines & Sorter</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
              Clean up messy lists, remove duplicate entries, strip empty blank lines, and sort items alphabetically in seconds.
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

        {/* Workspace Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Operations Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={removeDuplicates}
                className="px-4 py-2 rounded-xl bg-royalBlue text-white text-xs font-bold hover:bg-royalBlue/90 transition shadow-sm hover:scale-105 active:scale-95"
              >
                <Filter className="w-3.5 h-3.5 inline mr-1" /> Remove Duplicates
              </button>
              <button
                onClick={() => sortAlphabetical('asc')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
              >
                Sort A → Z
              </button>
              <button
                onClick={() => sortAlphabetical('desc')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
              >
                Sort Z → A
              </button>
              <button
                onClick={removeEmptyLines}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
              >
                Remove Blank Lines
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyText}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-sm flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Clean List
              </button>
              <button
                onClick={() => setInputText('')}
                className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                title="Clear text"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Options toggles */}
          <div className="flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="rounded text-royalBlue focus:ring-royalBlue"
              />
              <span>Case Sensitive ("Apple" ≠ "apple")</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={trimWhitespace}
                onChange={(e) => setTrimWhitespace(e.target.checked)}
                className="rounded text-royalBlue focus:ring-royalBlue"
              />
              <span>Trim Leading / Trailing Whitespace</span>
            </label>

            <span className="font-mono text-royalBlue dark:text-sky-400 ml-auto font-semibold">
              Total: {lineCount} line(s)
            </span>
          </div>

          {/* Text Area */}
          <textarea
            rows={12}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your lines here..."
            className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-royalBlue font-mono leading-relaxed"
          />
        </div>

        {/* Suggested Tools Section */}
        <SuggestedTools
          currentToolId="remove-duplicate-lines"
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

export default RemoveDuplicates;
