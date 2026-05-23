
import React, { useState, useEffect } from 'react';
import { Menu, X, Sun, Moon } from 'lucide-react';
import Logo from './Logo';

interface NavbarProps {
  isScrolled: boolean;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onNavigate: (id: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ isScrolled, isDarkMode, toggleTheme, onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Services', id: 'services' },
    { name: 'Tech', id: 'technology-stack' },
    { name: 'Process', id: 'process' },
    { name: 'Clients', id: 'our-clients' },
    { name: 'About', id: 'about' },
    { name: 'Contact', id: 'contact-us' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        const bottomOffset = 150;
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - bottomOffset) {
          setActiveSection('contact-us');
          return;
        }

        let currentSection = 'home';
        let minDistance = Infinity;

        for (const link of navLinks) {
          const el = document.getElementById(link.id);
          if (el) {
            const rect = el.getBoundingClientRect();
            const offset = 120;
            if (rect.top <= offset && rect.bottom > offset) {
              currentSection = link.id;
              break;
            }
            const distance = Math.abs(rect.top - offset);
            if (distance < minDistance) {
              minDistance = distance;
              currentSection = link.id;
            }
          }
        }
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-white/90 dark:bg-darkBg/90 backdrop-blur-md shadow-2xl py-3 border-b dark:border-slate-800' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div onClick={(e) => handleClick(e, 'home')} className="cursor-pointer">
            <Logo size={42} showText={true} inverted={!isScrolled && !isDarkMode} />
          </div>

          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <a 
                  key={link.name} 
                  href={`#${link.id}`}
                  onClick={(e) => handleClick(e, link.id)}
                  className={`font-bold text-[13px] uppercase tracking-[0.15em] transition-all relative pb-1 ${
                    isActive 
                      ? 'text-vibrantOrange font-extrabold' 
                      : isScrolled 
                        ? 'text-gray-800 dark:text-gray-100 hover:text-vibrantOrange' 
                        : 'text-white hover:text-vibrantOrange'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute bottom-[-4px] left-0 right-0 h-[2px] bg-vibrantOrange rounded-full" />
                  )}
                </a>
              );
            })}
            
            <button 
              onClick={toggleTheme}
              className={`p-3 rounded-2xl transition-all hover:scale-110 active:scale-90 ${isScrolled ? 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-yellow-400' : 'bg-white/20 text-white backdrop-blur-sm hover:bg-white/30'}`}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button 
              onClick={(e) => handleClick(e, 'contact-us')}
              className="bg-orange-gradient text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg hover:shadow-orange-500/30 hover:scale-105 transition-all"
            >
              Let's Talk
            </button>
          </div>

          <div className="lg:hidden flex items-center space-x-4">
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-xl transition-all ${isScrolled ? 'text-deepBlue dark:text-yellow-400' : 'text-white'}`}
            >
              {isDarkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-1 rounded-lg ${isScrolled ? 'text-deepBlue dark:text-white' : 'text-white'}`}
            >
              {mobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
            </button>
          </div>
        </div>
      </div>

      <div className={`lg:hidden transition-all duration-500 overflow-hidden ${mobileMenuOpen ? 'max-h-[450px] bg-white dark:bg-slate-900 opacity-100 border-b dark:border-slate-800' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 py-6 space-y-4 flex flex-col items-center">
          {navLinks.map((link) => {
            const isActive = activeSection === link.id;
            return (
              <a 
                key={link.name} 
                href={`#${link.id}`} 
                onClick={(e) => handleClick(e, link.id)}
                className={`block font-bold text-base uppercase tracking-wider transition-colors ${
                  isActive 
                    ? 'text-vibrantOrange' 
                    : 'text-gray-900 dark:text-white hover:text-vibrantOrange'
                }`}
              >
                {link.name}
              </a>
            );
          })}
          <button 
            onClick={(e) => handleClick(e, 'contact-us')}
            className="w-full max-w-sm text-center bg-orange-gradient text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wider shadow-md active:scale-95 transition-all"
          >
            Free Consultation
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
