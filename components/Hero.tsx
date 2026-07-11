
import React from 'react';
import { Cpu, Zap, CheckCircle, Code, Server, Cloud } from 'lucide-react';

interface HeroProps {
  onNavigate: (id: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <div className="relative min-h-[70vh] lg:min-h-[80vh] flex items-center pt-12 pb-10 lg:pt-14 lg:pb-12 overflow-hidden bg-hero-gradient">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-black opacity-10 dark:opacity-40"></div>
      
      {/* Animated Elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-lightOrange/20 rounded-full blur-3xl animate-bounce delay-1000"></div>

      {/* FLOATING TECHNOLOGY BADGES - ONLY ON MOBILE/TABLET VIEW (Using bulletproof vector SVGs, placed as background watermarks to ensure text is fully readable) */}
      {/* React - Upper Right corner margin */}
      <div className="absolute top-14 right-4 sm:right-10 animate-float-slow-y lg:hidden z-0 pointer-events-auto select-none opacity-40 dark:opacity-25 hover:opacity-100 transition-all duration-300">
        <div className="px-3 py-1.5 bg-[#0A3D62]/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg flex items-center space-x-1.5 hover:scale-110 hover:border-white/40 active:scale-95 transition-all duration-300 cursor-pointer">
          <svg className="w-4 h-4" viewBox="-11.5 -10.23 23 20.46" xmlns="http://www.w3.org/2000/svg">
            <circle cx="0" cy="0" r="2.05" fill="#61DAFB"/>
            <g stroke="#61DAFB" strokeWidth="1" fill="none">
              <ellipse rx="11" ry="4.2"/>
              <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
              <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
            </g>
          </svg>
          <span className="text-white text-[10px] font-bold tracking-tight">React</span>
        </div>
      </div>

      {/* Spring Boot - Mid-upper Left border margin */}
      <div className="absolute top-[26%] left-3 sm:left-8 animate-float-slow-diagonal lg:hidden z-0 pointer-events-auto select-none opacity-40 dark:opacity-25 hover:opacity-100 transition-all duration-300">
        <div className="px-3 py-1.5 bg-[#0A3D62]/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg flex items-center space-x-1.5 hover:scale-110 hover:border-white/40 active:scale-95 transition-all duration-300 cursor-pointer">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#6DB33F" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 .002C5.37.002 0 5.37 0 12s5.37 11.998 12 11.998 12-5.369 12-11.998S18.63.002 12 .002zm5.72 15.02c-.39-.12-1.07-.38-2.02-.69-1.39-.46-3.23-.74-4.83-.8-1.5-.06-2.58.12-2.9.23-.22.08-.31.25-.19.38.1.1.33.15.69.15.54 0 1.25-.13 1.93-.11.7.02 2.12.31 3.24.75 1.08.43 1.76.84 2.12.98.39.15.54.06.51-.15a1.4 1.4 0 0 0-.55-.74z"/>
          </svg>
          <span className="text-white text-[10px] font-bold tracking-tight">Spring Boot</span>
        </div>
      </div>

      {/* TypeScript - Mid Right border margin */}
      <div className="absolute top-[46%] right-3 sm:right-8 animate-float-slow-x lg:hidden z-0 pointer-events-auto select-none opacity-40 dark:opacity-25 hover:opacity-100 transition-all duration-300">
        <div className="px-3 py-1.5 bg-[#0A3D62]/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg flex items-center space-x-1.5 hover:scale-110 hover:border-white/40 active:scale-95 transition-all duration-300 cursor-pointer">
          <svg className="w-4 h-4 rounded-sm" viewBox="0 0 24 24" fill="#3178C6" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" fill="#3178C6"/>
            <text x="12" y="19" fill="white" fontSize="11" fontWeight="bold" fontFamily="system-ui, sans-serif" textAnchor="middle">TS</text>
          </svg>
          <span className="text-white text-[10px] font-bold tracking-tight">TypeScript</span>
        </div>
      </div>

      {/* Python - Lower Left outer margin */}
      <div className="absolute bottom-[20%] left-3 sm:left-8 animate-float-slow-y lg:hidden z-0 pointer-events-auto select-none opacity-40 dark:opacity-25 hover:opacity-100 transition-all duration-300">
        <div className="px-3 py-1.5 bg-[#0A3D62]/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg flex items-center space-x-1.5 hover:scale-110 hover:border-white/40 active:scale-95 transition-all duration-300 cursor-pointer">
          <svg className="w-4 h-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.93 0C5.35 0 5.75 2.87 5.75 2.87l.01 2.97h6.24v.88H5.75S3.17 6.4 3.17 12.95c0 6.56 2.27 6.27 2.27 6.27h1.36v-1.92s-.07-2.3 2.22-2.3h6.21s2.21.05 2.21-2.2v-6.2c0-2.25-1.93-3.13-3.52-3.33-1.12-.13-1.82-.27-1.82-.27zm-2.8 1.47a.74.74 0 1 1 0 1.48.74.74 0 0 1 0-1.48z" fill="#3776AB"/>
            <path d="M12.07 24c6.58 0 6.18-2.87 6.18-2.87l-.01-2.97h-6.24v-.88h6.24s2.58.32 2.58-6.23c0-6.56-2.27-6.27-2.27-6.27h-1.36v1.92s.07 2.3-2.22 2.3H8.76s-2.21-.05-2.21 2.2v6.2c0 2.25 1.93 3.13 3.52 3.33 1.12.13 1.82.27 1.82.27zM14.87 21c.4 0 .74.34.74.74a.74.74 0 1 1-.74-.74z" fill="#FFE082"/>
          </svg>
          <span className="text-white text-[10px] font-bold tracking-tight">Python</span>
        </div>
      </div>

      {/* Node.js - Background floating watermarks upper header */}
      <div className="absolute top-[18%] right-[15%] opacity-35 dark:opacity-20 animate-float-slow-diagonal lg:hidden z-0 pointer-events-auto select-none hover:opacity-100 transition-all duration-300">
        <div className="px-2.5 py-1.5 bg-[#0A3D62]/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-md flex items-center space-x-1.5 hover:scale-110 hover:border-white/40 active:scale-95 transition-all duration-300 cursor-pointer">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#339933" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L4.5 6.33v8.66L12 19.33l7.5-4.34V6.33L12 2zm5.75 12h-11.5V10h11.5v4z"/>
          </svg>
          <span className="text-white text-[9px] font-bold tracking-tight">Node.js</span>
        </div>
      </div>

      {/* .NET Core - Ambient background floating watermarks middle lower */}
      <div className="absolute bottom-[34%] left-[15%] opacity-35 dark:opacity-20 animate-float-slow-x lg:hidden z-0 pointer-events-auto select-none hover:opacity-100 transition-all duration-300">
        <div className="px-2.5 py-1.5 bg-[#0A3D62]/90 backdrop-blur-md rounded-2xl border border-white/20 shadow-md flex items-center space-x-1.5 hover:scale-110 hover:border-white/40 active:scale-95 transition-all duration-300 cursor-pointer">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="12" fill="#512BD4"/>
            <text x="50%" y="60%" fill="white" fontSize="8px" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">.NET</text>
          </svg>
          <span className="text-white text-[9px] font-bold tracking-tight">.NET Core</span>
        </div>
      </div>

      {/* Docker - Lower Right corner */}
      <div className="absolute bottom-10 right-4 sm:right-10 animate-float-slow-y lg:hidden z-0 pointer-events-auto select-none opacity-40 dark:opacity-25 hover:opacity-100 transition-all duration-300">
        <div className="px-3 py-1.5 bg-[#0A3D62]/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg flex items-center space-x-1.5 hover:scale-110 hover:border-white/40 active:scale-95 transition-all duration-300 cursor-pointer">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#2496ED" xmlns="http://www.w3.org/2000/svg">
            <path d="M13.9 8.2h-1.8V10h1.8V8.2zm2.2 0h-1.8V10h1.8V8.2zm-4.4-2.2h-1.8v1.8h1.8V6zm2.2 0h-1.8v1.8h1.8V6zm4.4 2.2H14.3V10h1.8V8.2zM1.14 12.42c1.03 2.17 3.32 3.66 5.96 3.66c3.42 0 6.27-2.48 6.78-5.74c.26-.06.52-.1.79-.1h7.83c.33 0 .6-.27.6-.6v-.3c0-1.65-1.35-3-3-3h-.91c-.28 0-.54.1-.75.29L19.2 6.5l.8.8c.23.23.23.61 0 .84c-.23.23-.61.23-.84 0l-.8-.8l-2.07 2.07H1.14z"/>
          </svg>
          <span className="text-white text-[10px] font-bold tracking-tight">Docker</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative text-white max-w-2xl px-1">
            
            {/* FOREGROUND CONTENT LAYER - Guaranteed to render strictly above the background watermark badges */}
            <div className="relative z-10 space-y-5">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-extrabold leading-tight">
                Empowering Businesses with <span className="text-transparent bg-clip-text bg-gradient-to-r from-lightOrange to-vibrantOrange">Smart Digital Solutions</span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl opacity-90 font-light leading-relaxed">
                ATON TECH Solutions builds powerful websites, scalable software systems, and AI-driven business platforms that accelerate your digital growth.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-3 pb-2 lg:pb-0">
                <button 
                  onClick={() => onNavigate('services')}
                  className="px-10 py-4 rounded-full bg-orange-gradient text-white font-bold text-lg text-center shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  Our Services
                </button>
                <button 
                  onClick={() => onNavigate('contact-us')}
                  className="px-10 py-4 rounded-full border-2 border-white/50 text-white font-bold text-lg text-center hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                >
                  Contact Us
                </button>
              </div>
            </div>
          </div>

          {/* DESKTOP FULL HUD & TECH CONSTELLATION GRAPHIC */}
          <div className="hidden lg:block w-full max-w-none mx-auto relative px-6 md:px-12">
            <div className="relative">
              {/* Central Premium Card */}
              <div className="glass-card p-4 rounded-[40px] shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-700 bg-white/5 backdrop-blur-xl border border-white/20">
                <div className="bg-white rounded-[32px] p-6 sm:p-12 shadow-inner overflow-hidden aspect-square flex items-center justify-center">
                  <img 
                    src="/logo-full.svg" 
                    alt="ATON TECH Solutions Logo" 
                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              
              {/* ORBITAL TECH BADGES CONSTELLATION */}
              {/* Spring Boot */}
              <div className="absolute -top-[45px] -left-[30px] animate-float-slow-x z-20 pointer-events-auto">
                <div className="px-3.5 py-2 bg-[#0A3D62]/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg flex items-center space-x-2 group hover:scale-110 hover:border-white/40 transition-all duration-300 select-none">
                  <img src="https://cdn.simpleicons.org/springboot/6DB33F" alt="Spring Boot" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                  <span className="text-white text-xs font-bold tracking-tight">Spring Boot</span>
                </div>
              </div>

              {/* React */}
              <div className="absolute -bottom-[45px] -right-[20px] animate-float-slow-y z-20 pointer-events-auto">
                <div className="px-3.5 py-2 bg-[#0A3D62]/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg flex items-center space-x-2 group hover:scale-110 hover:border-white/40 transition-all duration-300 select-none">
                  <img src="https://cdn.simpleicons.org/react/61DAFB" alt="React" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                  <span className="text-white text-xs font-bold tracking-tight">React</span>
                </div>
              </div>

              {/* .NET Core */}
              <div className="absolute top-1.5 -right-[90px] xl:-right-[110px] animate-float-slow-diagonal z-20 pointer-events-auto">
                <div className="px-3.5 py-2 bg-[#0A3D62]/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg flex items-center space-x-2 group hover:scale-110 hover:border-white/40 transition-all duration-300 select-none">
                  <img src="https://cdn.simpleicons.org/dotnet/512BD4" alt=".NET Core" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                  <span className="text-white text-xs font-bold tracking-tight">.NET Core</span>
                </div>
              </div>

              {/* TypeScript */}
              <div className="absolute -bottom-[40px] -left-[25px] animate-float-slow-x z-20 pointer-events-auto">
                <div className="px-3.5 py-2 bg-[#0A3D62]/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg flex items-center space-x-2 group hover:scale-110 hover:border-white/40 transition-all duration-300 select-none">
                  <img src="https://cdn.simpleicons.org/typescript/3178C6" alt="TypeScript" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                  <span className="text-white text-xs font-bold tracking-tight">TypeScript</span>
                </div>
              </div>

              {/* Python */}
              <div className="absolute -top-[70px] left-[32%] -translate-x-1/2 animate-float-slow-y z-20 pointer-events-auto">
                <div className="px-3.5 py-2 bg-[#0A3D62]/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg flex items-center space-x-2 group hover:scale-110 hover:border-white/40 transition-all duration-300 select-none">
                  <img src="https://cdn.simpleicons.org/python/3776AB" alt="Python" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                  <span className="text-white text-xs font-bold tracking-tight">Python</span>
                </div>
              </div>

              {/* Node.js */}
              <div className="absolute top-[40%] -left-[105px] animate-float-slow-diagonal z-20 pointer-events-auto">
                <div className="px-3.5 py-2 bg-[#0A3D62]/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg flex items-center space-x-2 group hover:scale-110 hover:border-white/40 transition-all duration-300 select-none">
                  <img src="https://cdn.simpleicons.org/nodedotjs/339933" alt="Node.js" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                  <span className="text-white text-xs font-bold tracking-tight">Node.js</span>
                </div>
              </div>

              {/* Docker */}
              <div className="absolute top-[40%] -right-[105px] animate-float-slow-x z-20 pointer-events-auto">
                <div className="px-3.5 py-2 bg-[#0A3D62]/95 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg flex items-center space-x-2 group hover:scale-110 hover:border-white/40 transition-all duration-300 select-none">
                  <img src="https://cdn.simpleicons.org/docker/2496ED" alt="Docker" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                  <span className="text-white text-xs font-bold tracking-tight">Docker</span>
                </div>
              </div>
              
              {/* SYSTEM SECURITY HUD FLOATING BADGE */}
              <div className="absolute bottom-16 -left-20 xl:-left-24 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 hover:border-green-400 dark:hover:border-green-400/50 p-4 rounded-2xl shadow-[0_12px_40px_rgba(74,222,128,0.18)] dark:shadow-[0_12px_40px_rgba(74,222,128,0.1)] w-60 sm:w-64 animate-float-badge-left transition-all duration-300 hover:scale-105 z-10 border-l-4 border-l-green-500">
                 <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center relative">
                      <CheckCircle size={24} />
                      <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green-500"></span>
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-extrabold text-sm tracking-wide">System Security</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 font-bold">Active Shield Live</p>
                    </div>
                 </div>
              </div>

              {/* FAST DELIVERY HUD FLOATING BADGE */}
              <div className="absolute top-16 -right-20 xl:-right-24 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 hover:border-vibrantOrange dark:hover:border-vibrantOrange/50 p-4 rounded-2xl shadow-[0_12px_40px_rgba(255,106,0,0.18)] dark:shadow-[0_12px_40px_rgba(255,106,0,0.1)] w-60 sm:w-64 animate-float-badge-right transition-all duration-300 hover:scale-105 z-10 border-l-4 border-l-vibrantOrange">
                 <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-vibrantOrange/10 text-vibrantOrange rounded-xl flex items-center justify-center relative">
                      <Zap size={24} />
                      <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-vibrantOrange opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-vibrantOrange"></span>
                      </span>
                    </div>
                    <div>
                      <p className="text-gray-900 dark:text-white font-extrabold text-sm tracking-wide">Fast Delivery</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5 font-bold">Agile Delivery</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* MOBILE & TABLET COMPACT HUD & LOGO ROW SUCCESSFULLY DISMISSED TO REDUCE SPACING */}
        </div>
      </div>
    </div>
  );
};

export default Hero;
