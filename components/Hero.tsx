
import React from 'react';

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
              <div className="glass-card p-8 rounded-3xl shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-700">
                <div className="bg-white/10 p-6 rounded-2xl mb-6">
                  <div className="h-4 w-3/4 bg-white/20 rounded-full mb-3"></div>
                  <div className="h-4 w-1/2 bg-white/20 rounded-full"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-20 bg-white/10 rounded-xl animate-pulse" style={{ animationDelay: `${i * 200}ms` }}></div>
                  ))}
                </div>
                <div className="mt-6 flex justify-between items-center">
                  <div className="h-8 w-8 bg-vibrantOrange rounded-full"></div>
                  <div className="h-4 w-24 bg-white/20 rounded-full"></div>
                </div>
              </div>
              
              <div className="absolute -bottom-10 -left-10 glass-card p-6 rounded-2xl shadow-xl w-64 animate-bounce hover:animation-none">
                 <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">System Ready</p>
                      <p className="text-white/60 text-xs">AI Optimization Active</p>
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
