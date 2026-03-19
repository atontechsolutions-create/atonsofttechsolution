
import React from 'react';
import { Cpu, Zap, CheckCircle, Code, Server, Cloud } from 'lucide-react';

interface HeroProps {
  onNavigate: (id: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <div className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-hero-gradient">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-black opacity-10 dark:opacity-40"></div>
      
      {/* Animated Elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-lightOrange/20 rounded-full blur-3xl animate-bounce delay-1000"></div>
      
      {/* Floating Tech Icons */}
      <div className="absolute top-1/4 left-10 animate-bounce delay-300 hidden md:block">
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl">
          <img src="https://cdn.simpleicons.org/springboot/6DB33F" alt="Java" className="w-8 h-8" referrerPolicy="no-referrer" />
        </div>
      </div>
      <div className="absolute bottom-1/4 right-10 animate-bounce delay-700 hidden md:block">
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl">
          <img src="https://cdn.simpleicons.org/css/1572B6" alt="CSS3" className="w-8 h-8" referrerPolicy="no-referrer" />
        </div>
      </div>
      <div className="absolute top-1/3 right-1/4 animate-pulse hidden md:block">
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl">
          <img src="https://cdn.simpleicons.org/amazonaws/232F3E" alt="AWS" className="w-8 h-8" referrerPolicy="no-referrer" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-8 max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-tight">
              Empowering Businesses with <span className="text-transparent bg-clip-text bg-gradient-to-r from-lightOrange to-vibrantOrange">Smart Digital Solutions</span>
            </h1>
            <p className="text-xl md:text-2xl opacity-90 font-light leading-relaxed">
              ATON TECH Solutions builds powerful websites, scalable software systems, and AI-driven business platforms that accelerate your digital growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => onNavigate('services')}
                className="px-10 py-4 rounded-full bg-orange-gradient text-white font-bold text-lg text-center shadow-2xl hover:scale-105 transition-transform"
              >
                Our Services
              </button>
              <button 
                onClick={() => onNavigate('contact-us')}
                className="px-10 py-4 rounded-full border-2 border-white/50 text-white font-bold text-lg text-center hover:bg-white/10 transition-all backdrop-blur-sm"
              >
                Contact Us
              </button>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <div className="glass-card p-4 rounded-[40px] shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-700 bg-white/5 backdrop-blur-xl border border-white/20">
                <div className="bg-white rounded-[32px] p-12 shadow-inner overflow-hidden aspect-square flex items-center justify-center">
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                    <div className="w-32 h-32 relative overflow-hidden rounded-3xl group-hover:scale-105 transition-transform duration-500">
                      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
                        <defs>
                          <linearGradient id="heroLogoBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#0A3D62" />
                            <stop offset="100%" stopColor="#1E5EFF" />
                          </linearGradient>
                          <linearGradient id="heroLogoOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF6A00" />
                            <stop offset="100%" stopColor="#FFA502" />
                          </linearGradient>
                        </defs>
                        <path d="M50 10 L15 85 L50 85 Z" fill="url(#heroLogoBlue)" />
                        <path d="M50 10 L85 85 L50 85 Z" fill="url(#heroLogoOrange)" />
                        <rect x="35" y="45" width="30" height="30" transform="rotate(45 50 60)" fill="white" />
                        <text x="50" y="66" fontSize="16" fontWeight="900" fill="#0A3D62" textAnchor="middle" fontFamily="monospace">{"</>"}</text>
                        <circle cx="50" cy="5" r="3" fill="#1E5EFF" />
                        <line x1="50" y1="5" x2="50" y2="12" stroke="#1E5EFF" strokeWidth="2" />
                        <circle cx="42" cy="12" r="2.5" fill="#0A3D62" />
                        <circle cx="58" cy="12" r="2.5" fill="#FF6A00" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <div className="font-display font-black text-4xl text-deepBlue">ATON <span className="text-vibrantOrange">TECH</span></div>
                      <div className="text-xs font-bold text-gray-400 tracking-[0.3em]">SOLUTIONS</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-10 -left-10 glass-card p-6 rounded-2xl shadow-xl w-64 animate-bounce hover:animation-none">
                 <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center shadow-lg shadow-green-400/20">
                      <CheckCircle className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">System Ready</p>
                      <p className="text-white/60 text-xs">AI Optimization Active</p>
                    </div>
                 </div>
              </div>

              <div className="absolute -top-10 -right-10 glass-card p-6 rounded-2xl shadow-xl w-64 animate-pulse">
                 <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-vibrantOrange rounded-full flex items-center justify-center shadow-lg shadow-orange-400/20">
                      <Zap className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Fast Delivery</p>
                      <p className="text-white/60 text-xs">Agile Development</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
