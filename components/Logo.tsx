
import React from 'react';

const Logo: React.FC<{ size?: number; showText?: boolean; inverted?: boolean }> = ({ size = 48, showText = true, inverted = false }) => {
  return (
    <div className="flex items-center space-x-3 group cursor-pointer">
      <div className="relative overflow-hidden rounded-xl flex-shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          <defs>
            <linearGradient id="logoBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D2FF" />
              <stop offset="40%" stopColor="#0066FF" />
              <stop offset="100%" stopColor="#001C55" />
            </linearGradient>
            <linearGradient id="logoOrange" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF000" />
              <stop offset="40%" stopColor="#FF6A00" />
              <stop offset="100%" stopColor="#801000" />
            </linearGradient>
            <filter id="logoShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Left Blue Curved Wing */}
          <path d="M 44 32 C 44 32, 43 50, 31 63 C 31 63, 40 76, 45 83 C 45 83, 22 88, 8 92 C 18 70, 32 46, 44 32 Z" fill="url(#logoBlue)" />

          {/* Right Orange Curved Wing */}
          <path d="M 56 32 C 56 32, 57 50, 69 63 C 69 63, 60 76, 55 83 C 55 83, 78 88, 92 92 C 82 70, 68 46, 56 32 Z" fill="url(#logoOrange)" />

          {/* Circuit Lines rising from the top */}
          <path d="M 41 38 L 41 22" stroke="#0066FF" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 47 34 L 47 10" stroke="#00D2FF" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 53 34 L 53 14" stroke="#FF6A00" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M 59 38 L 59 26" stroke="#FF8C00" strokeWidth="1.8" strokeLinecap="round" />

          {/* Hollow Circuit Rings */}
          <circle cx="41" cy="22" r="2.5" fill="white" stroke="#0066FF" strokeWidth="1.8" />
          <circle cx="47" cy="10" r="2.5" fill="white" stroke="#00D2FF" strokeWidth="1.8" />
          <circle cx="53" cy="14" r="2.5" fill="white" stroke="#FF6A00" strokeWidth="1.8" />
          <circle cx="59" cy="26" r="2.5" fill="white" stroke="#FF8C00" strokeWidth="1.8" />

          {/* Central Floating Diamond */}
          <rect x="36" y="48" width="28" height="28" rx="4" transform="rotate(45 50 62)" fill="white" filter="url(#logoShadow)" />

          {/* Code Symbol (</>) inside Diamond */}
          <path d="M 43.5 57.5 L 39 62 L 43.5 66.5" stroke="#0A2E5C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 48 67 L 52 57" stroke="#0A2E5C" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M 56.5 57.5 L 61 62 L 56.5 66.5" stroke="#0A2E5C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <div className={`font-display font-black text-2xl leading-none tracking-tighter ${inverted ? 'text-white' : 'text-deepBlue dark:text-white'}`}>
            ATON <span className="text-vibrantOrange">TECH</span>
          </div>
          <div className={`text-[9px] font-bold uppercase tracking-[0.2em] opacity-80 ${inverted ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
            SOLUTIONS
          </div>
        </div>
      )}
    </div>
  );
};

export default Logo;
