
import React from 'react';
import Logo from './Logo';

interface FooterProps {
  onNavigate: (id: string) => void;
  onNavigateRoute?: (path: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate, onNavigateRoute }) => {
  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    onNavigate(id);
  };

  const handleRouteClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (onNavigateRoute) {
      onNavigateRoute(path);
    } else {
      window.location.href = path;
    }
  };

  return (
    <footer className="bg-deepBlue dark:bg-slate-950 text-white pt-24 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8">
            <div onClick={(e) => handleClick(e, 'home')} className="cursor-pointer inline-block">
              <Logo size={64} showText={true} inverted={true} />
            </div>
            <p className="text-gray-400 text-lg leading-relaxed font-medium">
              ATON TECH Solutions - Building the architecture of tomorrow with smart AI-driven software.
            </p>
            <div className="flex space-x-4">
               <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-royalBlue transition-colors flex items-center justify-center cursor-pointer">
                  <span className="font-bold">in</span>
               </div>
               <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-blue-400 transition-colors flex items-center justify-center cursor-pointer">
                  <span className="font-bold">X</span>
               </div>
               <div className="w-10 h-10 rounded-full bg-white/10 hover:bg-vibrantOrange transition-colors flex items-center justify-center cursor-pointer">
                  <span className="font-bold">Ig</span>
               </div>
            </div>
          </div>

          <div>
            <h4 className="text-xl font-black mb-8 font-display uppercase tracking-widest text-vibrantOrange">Navigation</h4>
            <ul className="space-y-4 text-gray-400 font-bold">
              <li><button onClick={(e) => handleClick(e, 'home')} className="hover:text-white transition-colors">Home</button></li>
              <li><button onClick={(e) => handleClick(e, 'about')} className="hover:text-white transition-colors">About Us</button></li>
              <li><button onClick={(e) => handleClick(e, 'services')} className="hover:text-white transition-colors">Services</button></li>
              <li>
                <button 
                  onClick={(e) => handleRouteClick(e, '/tools')} 
                  className="hover:text-vibrantOrange transition-colors flex items-center gap-2"
                >
                  <span>Free Tools Directory</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-vibrantOrange text-white font-black tracking-normal">
                    FREE
                  </span>
                </button>
              </li>
              <li>
                <button 
                  onClick={(e) => handleRouteClick(e, '/tools/signature-resizer')} 
                  className="hover:text-vibrantOrange transition-colors text-xs text-gray-500 pl-2"
                >
                  → Signature Resizer
                </button>
              </li>
              <li>
                <button 
                  onClick={(e) => handleRouteClick(e, '/tools/image-compressor')} 
                  className="hover:text-vibrantOrange transition-colors text-xs text-gray-500 pl-2"
                >
                  → Image Compressor
                </button>
              </li>
              <li><button onClick={(e) => handleClick(e, 'technology-stack')} className="hover:text-white transition-colors">Stack</button></li>
              <li><button onClick={(e) => handleClick(e, 'contact-us')} className="hover:text-white transition-colors">Get in Touch</button></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-black mb-8 font-display uppercase tracking-widest text-royalBlue">Specialties</h4>
            <ul className="space-y-4 text-gray-400 font-bold">
              <li className="flex items-center space-x-2"><span>&bull;</span><span>E-commerce Platforms</span></li>
              <li className="flex items-center space-x-2"><span>&bull;</span><span>Custom Enterprise CRM</span></li>
              <li className="flex items-center space-x-2"><span>&bull;</span><span>AI Business Process</span></li>
              <li className="flex items-center space-x-2"><span>&bull;</span><span>Mobile App Ecosystems</span></li>
              <li className="flex items-center space-x-2"><span>&bull;</span><span>Cloud Infrastructure</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-black mb-8 font-display uppercase tracking-widest text-white">Global Reach</h4>
            <ul className="space-y-8 text-gray-400">
              <li className="flex flex-col">
                <span className="text-white font-black text-xs uppercase tracking-widest mb-2">Connect via Email</span>
                <a href="mailto:atontechsolutions@gmail.com" className="text-lg font-bold hover:text-vibrantOrange transition-colors">atontechsolutions@gmail.com</a>
              </li>
              <li className="flex flex-col">
                <span className="text-white font-black text-xs uppercase tracking-widest mb-2">Technical Support</span>
                <a href="https://wa.me/919420841427" target="_blank" className="text-lg font-bold hover:text-green-400 transition-colors">Chat on WhatsApp</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0 text-gray-500 font-bold text-sm tracking-wide">
          <p className="whitespace-nowrap text-[11px] [@media(min-width:375px)]:text-xs sm:text-sm">© 2026 ATON TECH Solutions. All Rights Reserved.</p>
          <div className="flex space-x-6 sm:space-x-10 text-xs sm:text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Shield</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Operations</a>
          </div>
        </div>
      </div>
      <div className="h-2 bg-orange-gradient w-full mt-12"></div>
    </footer>
  );
};

export default Footer;
