import React, { useState } from 'react';
import {
  Type,
  Copy,
  Trash2,
  Share2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface TextCaseConverterProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const TextCaseConverter: React.FC<TextCaseConverterProps> = ({ onNavigateHome, onNavigateToTool }) => {
  const [inputText, setInputText] = useState('Transform your text effortlessly with ATON TECH Solutions.');

  const convertUpper = () => setInputText((prev) => prev.toUpperCase());
  const convertLower = () => setInputText((prev) => prev.toLowerCase());

  const convertTitleCase = () => {
    setInputText((prev) =>
      prev
        .toLowerCase()
        .split(' ')
        .map((w) => (w.length > 0 ? w[0].toUpperCase() + w.slice(1) : ''))
        .join(' ')
    );
  };

  const convertSentenceCase = () => {
    setInputText((prev) =>
      prev
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase())
    );
  };

  const convertCamelCase = () => {
    setInputText((prev) =>
      prev
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => (index === 0 ? word.toLowerCase() : word.toUpperCase()))
        .replace(/\s+/g, '')
    );
  };

  const convertSnakeCase = () => {
    setInputText((prev) =>
      prev
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^\w_]/g, '')
    );
  };

  const convertKebabCase = () => {
    setInputText((prev) =>
      prev
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]/g, '')
    );
  };

  const copyText = () => {
    if (!inputText) return;
    navigator.clipboard.writeText(inputText);
    toast.success('Converted text copied to clipboard!');
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
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Text Case Converter</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
              Convert text between UPPERCASE, lowercase, Title Case, Sentence case, camelCase, snake_case, and kebab-case with one click.
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

        {/* Buttons Action Bar */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={convertUpper}
              className="px-4 py-2 rounded-xl text-xs font-bold uppercase bg-royalBlue text-white hover:bg-royalBlue/90 transition shadow-sm"
            >
              UPPERCASE
            </button>
            <button
              onClick={convertLower}
              className="px-4 py-2 rounded-xl text-xs font-bold lowercase bg-slate-800 text-white hover:bg-slate-900 dark:bg-slate-700 transition shadow-sm"
            >
              lowercase
            </button>
            <button
              onClick={convertTitleCase}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition shadow-sm"
            >
              Title Case
            </button>
            <button
              onClick={convertSentenceCase}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm"
            >
              Sentence case
            </button>
            <button
              onClick={convertCamelCase}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-600 transition shadow-sm font-mono"
            >
              camelCase
            </button>
            <button
              onClick={convertSnakeCase}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 text-white hover:bg-cyan-700 transition shadow-sm font-mono"
            >
              snake_case
            </button>
            <button
              onClick={convertKebabCase}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition shadow-sm font-mono"
            >
              kebab-case
            </button>
          </div>

          {/* Text Area */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Text Workspace</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyText}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-royalBlue text-white hover:bg-royalBlue/90 transition shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Result
                </button>
                <button
                  onClick={() => setInputText('')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear
                </button>
              </div>
            </div>

            <textarea
              rows={10}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste or type text to convert cases..."
              className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base focus:outline-none focus:ring-2 focus:ring-royalBlue font-mono leading-relaxed"
            />
          </div>
        </div>

        {/* Suggested Tools Section */}
        <SuggestedTools
          currentToolId="text-case-converter"
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

export default TextCaseConverter;
