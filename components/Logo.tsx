
import React from 'react';

const Logo: React.FC<{ size?: number; showText?: boolean; inverted?: boolean }> = ({ size = 48, showText = true, inverted = false }) => {
  return (
    <div className="flex items-center space-x-3 group cursor-pointer">
      <div className="relative overflow-hidden rounded-xl flex-shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          <defs>
            <linearGradient id="logoBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0A3D62" />
              <stop offset="100%" stopColor="#1E5EFF" />
            </linearGradient>
            <linearGradient id="logoOrange" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6A00" />
              <stop offset="100%" stopColor="#FFA502" />
            </linearGradient>
          </defs>
          <path d="M50 10 L15 85 L50 85 Z" fill="url(#logoBlue)" />
          <path d="M50 10 L85 85 L50 85 Z" fill="url(#logoOrange)" />
          <rect x="35" y="45" width="30" height="30" transform="rotate(45 50 60)" fill="white" />
          <text x="50" y="66" fontSize="16" fontWeight="900" fill="#0A3D62" textAnchor="middle" fontFamily="monospace">{"</>"}</text>
          <circle cx="50" cy="5" r="3" fill="#1E5EFF" />
          <line x1="50" y1="5" x2="50" y2="12" stroke="#1E5EFF" strokeWidth="2" />
          <circle cx="42" cy="12" r="2.5" fill="#0A3D62" />
          <circle cx="58" cy="12" r="2.5" fill="#FF6A00" />
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
