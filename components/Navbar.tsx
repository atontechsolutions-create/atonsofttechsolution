
import React, { useState } from 'react';
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

  const navLinks = [
    { name: 'Home', id: 'home' },
    { name: 'About', id: 'about' },
    { name: 'Services', id: 'services' },
    { name: 'Process', id: 'process' },
    { name: 'Tech', id: 'technology-stack' },
    { name: 'Clients', id: 'our-clients' },
    { name: 'Contact', id: 'contact-us' },
  ];

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
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={`#${link.id}`}
                onClick={(e) => handleClick(e, link.id)}
                className={`font-bold text-[13px] uppercase tracking-[0.15em] transition-all hover:text-vibrantOrange ${isScrolled ? 'text-gray-800 dark:text-gray-100' : 'text-white'}`}
              >
                {link.name}
              </a>
            ))}
            
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

      <div className={`lg:hidden transition-all duration-500 overflow-hidden ${mobileMenuOpen ? 'max-h-screen bg-white dark:bg-slate-900 opacity-100 border-b dark:border-slate-800' : 'max-h-0 opacity-0'}`}>
        <div className="px-6 py-10 space-y-6 flex flex-col items-center">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={`#${link.id}`} 
              onClick={(e) => handleClick(e, link.id)}
              className="block text-gray-900 dark:text-white font-black text-2xl uppercase tracking-tighter hover:text-vibrantOrange transition-colors"
            >
              {link.name}
            </a>
          ))}
          <button 
            onClick={(e) => handleClick(e, 'contact-us')}
            className="w-full text-center bg-orange-gradient text-white py-5 rounded-2xl font-black text-xl shadow-xl active:scale-95 transition-transform"
          >
            FREE CONSULTATION
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
