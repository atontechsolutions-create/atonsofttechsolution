import React, { useState } from 'react';
import {
  Shield,
  Copy,
  RefreshCw,
  Share2,
  CheckCircle2,
  Lock,
  Zap,
} from 'lucide-react';
import toast from 'react-hot-toast';
import SuggestedTools from './SuggestedTools';
import AdSenseUnit from './AdSenseUnit';

interface PasswordGeneratorProps {
  onNavigateHome?: (sectionId?: string) => void;
  onNavigateToTool?: (path: string) => void;
}

const PasswordGenerator: React.FC<PasswordGeneratorProps> = ({ onNavigateHome, onNavigateToTool }) => {
  const [length, setLength] = useState<number>(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [password, setPassword] = useState('');

  const generatePassword = () => {
    let chars = '';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~|}{[]:;?><,.-=';

    if (includeUppercase) chars += upper;
    if (includeLowercase) chars += lower;
    if (includeNumbers) chars += numbers;
    if (includeSymbols) chars += symbols;

    if (!chars) {
      toast.error('Please select at least one character type!');
      return;
    }

    if (excludeSimilar) {
      // Remove i, l, 1, L, o, 0, O
      chars = chars.replace(/[il1Lo0O]/g, '');
    }

    // Cryptographically secure random values via Web Crypto API
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length];
    }

    setPassword(result);
  };

  React.useEffect(() => {
    generatePassword();
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols, excludeSimilar]);

  const copyPassword = () => {
    if (!password) return;
    navigator.clipboard.writeText(password);
    toast.success('Password copied securely to clipboard!');
  };

  // Evaluate password entropy / strength
  const getStrength = () => {
    if (length < 8) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
    if (length < 12) return { label: 'Medium', color: 'bg-amber-500', width: '50%' };
    if (length < 16) return { label: 'Strong', color: 'bg-blue-600', width: '75%' };
    return { label: 'Very Strong', color: 'bg-emerald-500', width: '100%' };
  };

  const strength = getStrength();

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
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">Strong Password Generator</h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl">
              Create cryptographically secure, randomized passwords locally on your device with customizable length, symbols, and memorability.
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

        {/* Generator Main Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-10 shadow-sm max-w-3xl mx-auto space-y-6">
          {/* Display Output Banner */}
          <div className="relative p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
            <span className="font-mono text-xl sm:text-2xl font-bold tracking-wider text-royalBlue dark:text-sky-400 break-all select-all">
              {password}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={generatePassword}
                className="p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                title="Regenerate"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button
                onClick={copyPassword}
                className="px-4 py-2.5 rounded-xl bg-royalBlue text-white text-xs font-bold hover:bg-royalBlue/90 transition shadow-sm flex items-center gap-1.5 hover:scale-105 active:scale-95"
              >
                <Copy className="w-4 h-4" /> Copy
              </button>
            </div>
          </div>

          {/* Strength meter */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-500">Security Strength</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{strength.label}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${strength.color}`}
                style={{ width: strength.width }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            {/* Length Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold">
                <span>Password Length</span>
                <span className="font-mono text-royalBlue dark:text-sky-400 font-bold">{length} characters</span>
              </div>
              <input
                type="range"
                min={6}
                max={64}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full accent-royalBlue cursor-pointer"
              />
            </div>

            {/* Checkbox toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  className="rounded text-royalBlue focus:ring-royalBlue w-4 h-4"
                />
                <span className="font-medium">Uppercase Letters (A-Z)</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={(e) => setIncludeLowercase(e.target.checked)}
                  className="rounded text-royalBlue focus:ring-royalBlue w-4 h-4"
                />
                <span className="font-medium">Lowercase Letters (a-z)</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="rounded text-royalBlue focus:ring-royalBlue w-4 h-4"
                />
                <span className="font-medium">Numbers (0-9)</span>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="rounded text-royalBlue focus:ring-royalBlue w-4 h-4"
                />
                <span className="font-medium">Special Symbols (!@#$)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Suggested Tools Section */}
        <SuggestedTools
          currentToolId="random-password-generator"
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

export default PasswordGenerator;
