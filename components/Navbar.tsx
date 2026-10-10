import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  Image as ImageIcon,
  PenTool,
  Minimize2,
  RefreshCw,
  FileText,
  Music,
  ArrowRight,
  Sparkles,
  Camera,
  Layers,
  Scissors,
  Mic,
  Video,
  Wifi,
  Globe,
  Sliders,
  Type,
  Shield,
  FileCheck,
  Code,
  Palette,
  Grid,
  FileCode,
} from 'lucide-react';
import Logo from './Logo';

interface NavbarProps {
  isScrolled: boolean;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onNavigate: (id: string) => void;
  currentPath?: string;
  onNavigateRoute?: (path: string) => void;
}

interface NavToolItem {
  name: string;
  desc: string;
  path?: string;
  icon: React.ReactNode;
  isAvailable: boolean;
  badge?: string;
}

interface ToolSection {
  title: string;
  categoryIcon: React.ReactNode;
  items: NavToolItem[];
}

const TOOL_SECTIONS: ToolSection[] = [
  {
    title: 'Photo & Signatures',
    categoryIcon: <PenTool size={16} className="text-emerald-500" />,
    items: [
      {
        name: 'Photo Resizer',
        desc: 'Custom width, height, aspect ratio & DPI',
        path: '/tools/photo-resizer',
        icon: <ImageIcon size={15} className="text-royalBlue" />,
        isAvailable: true,
        badge: 'Popular',
      },
      {
        name: 'Signature Resizer',
        desc: '140×60 px, clean white paper & ≤ 20 KB',
        path: '/tools/signature-resizer',
        icon: <PenTool size={15} className="text-emerald-500" />,
        isAvailable: true,
        badge: 'Essential',
      },
      {
        name: 'Passport Photo Maker',
        desc: 'Official 300 DPI single biometric crop',
        path: '/tools/passport-photo-maker',
        icon: <Camera size={15} className="text-blue-500" />,
        isAvailable: true,
        badge: 'Official',
      },
      {
        name: 'Multiple Passport Photos (8 Photos)',
        desc: 'Tile 8 photos on 4×6" postcard sheet',
        path: '/tools/multiple-passport-photos-page',
        icon: <Grid size={15} className="text-emerald-600" />,
        isAvailable: true,
        badge: '8 Photos',
      },
      {
        name: 'Photo Background Changer',
        desc: 'Change background without affecting user photo',
        path: '/tools/photo-background-changer',
        icon: <Palette size={15} className="text-purple-600" />,
        isAvailable: true,
      },
      {
        name: 'Signature Background Remover',
        desc: 'Erase paper shadows, make transparent or white',
        path: '/tools/signature-background-remover',
        icon: <Sparkles size={15} className="text-emerald-500" />,
        isAvailable: true,
        badge: 'New',
      },
      {
        name: 'Online Signature Maker',
        desc: 'Draw or type handwritten digital e-signatures',
        path: '/tools/online-signature-maker',
        icon: <PenTool size={15} className="text-blue-500" />,
        isAvailable: true,
        badge: 'New',
      },
      {
        name: 'White Background Maker',
        desc: '1-Click 100% pure white #FFFFFF backdrop',
        path: '/tools/white-background-maker',
        icon: <Sparkles size={15} className="text-amber-500" />,
        isAvailable: true,
      },
      {
        name: 'Indian Exam Resizer',
        desc: 'UPSC, SSC, IBPS 20KB-50KB specs with DOP banner',
        path: '/tools/indian-exam-resizer',
        icon: <FileCheck size={15} className="text-amber-500" />,
        isAvailable: true,
      },
      {
        name: 'Photo & Signature Combo',
        desc: 'Dual-slot exam form & portal resizer',
        path: '/tools/photo-signature-resizer',
        icon: <ImageIcon size={15} className="text-vibrantOrange" />,
        isAvailable: true,
      },
    ],
  },
  {
    title: 'Image Tools',
    categoryIcon: <ImageIcon size={16} className="text-royalBlue" />,
    items: [
      {
        name: 'Image Compressor',
        desc: 'Target 10KB, 20KB, 50KB, 100KB, 200KB',
        path: '/tools/image-compressor',
        icon: <Minimize2 size={15} className="text-royalBlue" />,
        isAvailable: true,
        badge: 'Fast',
      },
      {
        name: 'Image Converter (56 Formats)',
        desc: 'Instant JPG, PNG, WebP, BMP, TIFF, ICO, AVIF',
        path: '/tools/image-converter',
        icon: <RefreshCw size={15} className="text-purple-600" />,
        isAvailable: true,
        badge: '56 Formats',
      },
      {
        name: 'JPG to PNG / PNG to JPG',
        desc: 'Fidelity preserving lossless format swap',
        path: '/tools/jpg-to-png',
        icon: <RefreshCw size={15} className="text-purple-500" />,
        isAvailable: true,
      },
      {
        name: 'Image to Base64 / SVG',
        desc: 'Encode image to Data URI & CSS snippet',
        path: '/tools/image-to-base64',
        icon: <Code size={15} className="text-indigo-500" />,
        isAvailable: true,
      },
    ],
  },
  {
    title: 'PDF & Documents',
    categoryIcon: <FileText size={16} className="text-rose-500" />,
    items: [
      {
        name: 'Merge PDF',
        desc: 'Combine multiple PDF files into one',
        path: '/tools/merge-pdf',
        icon: <Layers size={15} className="text-rose-500" />,
        isAvailable: true,
        badge: 'Popular',
      },
      {
        name: 'Split & Extract PDF',
        desc: 'Extract pages, split by range & single pages',
        path: '/tools/split-pdf',
        icon: <Scissors size={15} className="text-rose-500" />,
        isAvailable: true,
      },
      {
        name: 'Image to PDF Converter',
        desc: 'Convert JPG/PNG to printable PDF',
        path: '/tools/image-to-pdf',
        icon: <FileText size={15} className="text-rose-500" />,
        isAvailable: true,
        badge: 'Popular',
      },
      {
        name: 'PDF to JPG & Word',
        desc: 'Convert PDF sheets to images and docx',
        path: '/tools/pdf-to-jpg',
        icon: <FileCode size={15} className="text-rose-500" />,
        isAvailable: true,
      },
    ],
  },
  {
    title: 'Hardware & Network',
    categoryIcon: <Wifi size={16} className="text-cyan-500" />,
    items: [
      {
        name: 'Microphone Tester',
        desc: 'Audio meter, record & playback test',
        path: '/tools/mic-tester',
        icon: <Mic size={15} className="text-cyan-500" />,
        isAvailable: true,
      },
      {
        name: 'Webcam Tester',
        desc: 'HD video preview, resolution & FPS',
        path: '/tools/webcam-tester',
        icon: <Video size={15} className="text-cyan-500" />,
        isAvailable: true,
      },
      {
        name: 'Internet Speed Test',
        desc: 'Real-time Mbps download, upload & ping',
        path: '/tools/internet-speed-test',
        icon: <Wifi size={15} className="text-cyan-500" />,
        isAvailable: true,
        badge: 'Live',
      },
      {
        name: 'IP & DNS Lookup',
        desc: 'Public IPv4/IPv6 & WHOIS diagnostics',
        path: '/tools/ip-checker',
        icon: <Globe size={15} className="text-cyan-500" />,
        isAvailable: true,
      },
    ],
  },
];

const Navbar: React.FC<NavbarProps> = ({
  isScrolled,
  isDarkMode,
  toggleTheme,
  onNavigate,
  currentPath = '/',
  onNavigateRoute,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('home');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAnyToolRoute = currentPath.startsWith('/tools');

  const baseNavLinks = [
    { name: 'Home', id: 'home' },
    { name: 'Services', id: 'services' },
    { name: 'Tech', id: 'technology-stack' },
    { name: 'Process', id: 'process' },
    { name: 'Clients', id: 'our-clients' },
    { name: 'About', id: 'about' },
    { name: 'Contact', id: 'contact-us' },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update active section on scroll if on home page
  useEffect(() => {
    const handleScroll = () => {
      if (isAnyToolRoute) {
        setActiveSection('');
        return;
      }

      if (window.scrollY < 100) {
        setActiveSection('home');
        return;
      }

      const docHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollPos = window.scrollY;

      if (docHeight - (scrollPos + windowHeight) < 50) {
        setActiveSection('contact-us');
        return;
      }

      let currentSection = 'home';
      let minDistance = Infinity;

      for (const link of baseNavLinks) {
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
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPath, isAnyToolRoute]);

  const handleLinkClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setToolsDropdownOpen(false);
    setMobileMenuOpen(false);
    onNavigate(id);
  };

  const handleToolNavigate = (path: string) => {
    setToolsDropdownOpen(false);
    setMobileMenuOpen(false);
    if (onNavigateRoute) {
      onNavigateRoute(path);
    } else {
      window.location.href = path;
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-white/95 dark:bg-darkBg/95 backdrop-blur-md shadow-xl py-3 border-b dark:border-slate-800'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div onClick={(e) => handleLinkClick(e, 'home')} className="cursor-pointer">
            <Logo size={42} showText={true} inverted={!isScrolled && !isDarkMode} />
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-5 xl:space-x-6">
            <a
              href="#home"
              onClick={(e) => handleLinkClick(e, 'home')}
              className={`font-bold text-[13px] uppercase tracking-[0.15em] transition-all relative pb-1 ${
                activeSection === 'home' && !isAnyToolRoute
                  ? 'text-vibrantOrange font-extrabold'
                  : isScrolled
                  ? 'text-gray-800 dark:text-gray-100 hover:text-vibrantOrange'
                  : 'text-white hover:text-vibrantOrange'
              }`}
            >
              Home
            </a>

            <a
              href="#services"
              onClick={(e) => handleLinkClick(e, 'services')}
              className={`font-bold text-[13px] uppercase tracking-[0.15em] transition-all relative pb-1 ${
                activeSection === 'services' && !isAnyToolRoute
                  ? 'text-vibrantOrange font-extrabold'
                  : isScrolled
                  ? 'text-gray-800 dark:text-gray-100 hover:text-vibrantOrange'
                  : 'text-white hover:text-vibrantOrange'
              }`}
            >
              Services
            </a>

            {/* TOOLS DROPDOWN TRIGGER */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                className={`font-bold text-[13px] uppercase tracking-[0.15em] transition-all relative pb-1 flex items-center gap-1.5 ${
                  isAnyToolRoute
                    ? 'text-vibrantOrange font-extrabold'
                    : isScrolled
                    ? 'text-gray-800 dark:text-gray-100 hover:text-vibrantOrange'
                    : 'text-white hover:text-vibrantOrange'
                }`}
              >
                <span>Tools</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-vibrantOrange text-white font-extrabold tracking-normal">
                  FREE
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    toolsDropdownOpen ? 'rotate-180 text-vibrantOrange' : ''
                  }`}
                />
                {isAnyToolRoute && (
                  <span className="absolute bottom-[-4px] left-0 right-0 h-[2px] bg-vibrantOrange rounded-full" />
                )}
              </button>

              {/* Mega Dropdown Panel */}
              {toolsDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[840px] max-w-[94vw] rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-2xl p-6 transition-all animate-in fade-in zoom-in-95 duration-150 z-50">
                  <div className="grid grid-cols-4 gap-4">
                    {TOOL_SECTIONS.map((section) => (
                      <div key={section.title} className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-slate-800">
                          {section.categoryIcon}
                          <span className="text-[11px] font-black uppercase tracking-wider text-gray-900 dark:text-white truncate">
                            {section.title}
                          </span>
                        </div>

                        <div className="space-y-1">
                          {section.items.map((tool) => (
                            <div
                              key={tool.name}
                              onClick={() => {
                                if (tool.isAvailable && tool.path) {
                                  handleToolNavigate(tool.path);
                                }
                              }}
                              className={`p-2 rounded-xl transition-all ${
                                tool.isAvailable && tool.path
                                  ? 'cursor-pointer hover:bg-orange-50/70 dark:hover:bg-slate-800 group'
                                  : 'opacity-55 cursor-default'
                              }`}
                            >
                              <div className="flex items-center justify-between mb-0.5">
                                <div className="flex items-center gap-1.5">
                                  <div className="w-5 h-5 rounded-md bg-gray-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                    {tool.icon}
                                  </div>
                                  <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-vibrantOrange transition-colors line-clamp-1">
                                    {tool.name}
                                  </span>
                                </div>
                                {tool.badge && (
                                  <span
                                    className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded-full shrink-0 ${
                                      tool.isAvailable
                                        ? 'bg-orange-100 text-vibrantOrange dark:bg-orange-950/60 dark:text-orange-400'
                                        : 'bg-gray-100 text-gray-400 dark:bg-slate-800 dark:text-gray-500'
                                    }`}
                                  >
                                    {tool.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1 pl-6">
                                {tool.desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Dropdown Footer */}
                  <div className="mt-5 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Sparkles size={14} className="text-vibrantOrange" />
                      Section-wise Suite • 100% Client-side Processing • Free for all users
                    </span>
                    <button
                      onClick={() => handleToolNavigate('/tools')}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-royalBlue/20 text-royalBlue dark:text-blue-300 hover:bg-vibrantOrange hover:text-white font-bold transition-all"
                    >
                      <span>Explore all 40+ tools</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <a
              href="#technology-stack"
              onClick={(e) => handleLinkClick(e, 'technology-stack')}
              className={`font-bold text-[13px] uppercase tracking-[0.15em] transition-all relative pb-1 ${
                activeSection === 'technology-stack' && !isAnyToolRoute
                  ? 'text-vibrantOrange font-extrabold'
                  : isScrolled
                  ? 'text-gray-800 dark:text-gray-100 hover:text-vibrantOrange'
                  : 'text-white hover:text-vibrantOrange'
              }`}
            >
              Tech
            </a>

            <a
              href="#process"
              onClick={(e) => handleLinkClick(e, 'process')}
              className={`font-bold text-[13px] uppercase tracking-[0.15em] transition-all relative pb-1 ${
                activeSection === 'process' && !isAnyToolRoute
                  ? 'text-vibrantOrange font-extrabold'
                  : isScrolled
                  ? 'text-gray-800 dark:text-gray-100 hover:text-vibrantOrange'
                  : 'text-white hover:text-vibrantOrange'
              }`}
            >
              Process
            </a>

            <a
              href="#our-clients"
              onClick={(e) => handleLinkClick(e, 'our-clients')}
              className={`font-bold text-[13px] uppercase tracking-[0.15em] transition-all relative pb-1 ${
                activeSection === 'our-clients' && !isAnyToolRoute
                  ? 'text-vibrantOrange font-extrabold'
                  : isScrolled
                  ? 'text-gray-800 dark:text-gray-100 hover:text-vibrantOrange'
                  : 'text-white hover:text-vibrantOrange'
              }`}
            >
              Clients
            </a>

            <a
              href="#about"
              onClick={(e) => handleLinkClick(e, 'about')}
              className={`font-bold text-[13px] uppercase tracking-[0.15em] transition-all relative pb-1 ${
                activeSection === 'about' && !isAnyToolRoute
                  ? 'text-vibrantOrange font-extrabold'
                  : isScrolled
                  ? 'text-gray-800 dark:text-gray-100 hover:text-vibrantOrange'
                  : 'text-white hover:text-vibrantOrange'
              }`}
            >
              About
            </a>

            <a
              href="#contact-us"
              onClick={(e) => handleLinkClick(e, 'contact-us')}
              className={`font-bold text-[13px] uppercase tracking-[0.15em] transition-all relative pb-1 ${
                activeSection === 'contact-us' && !isAnyToolRoute
                  ? 'text-vibrantOrange font-extrabold'
                  : isScrolled
                  ? 'text-gray-800 dark:text-gray-100 hover:text-vibrantOrange'
                  : 'text-white hover:text-vibrantOrange'
              }`}
            >
              Contact
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={`p-2.5 rounded-full transition-all duration-300 ${
                isScrolled
                  ? 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {isDarkMode ? (
                <Sun size={20} className="text-lightOrange hover:rotate-90 transition-transform duration-300" />
              ) : (
                <Moon size={20} className="hover:-rotate-12 transition-transform duration-300" />
              )}
            </button>

            {/* Consultation CTA button */}
            <div className="hidden sm:block">
              <button
                onClick={(e) => handleLinkClick(e, 'contact-us')}
                className="btn-magnetic px-5 py-2.5 rounded-full bg-orange-gradient text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:shadow-orange-500/30 active:scale-95 transition-all duration-300"
              >
                Free Consultation
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg lg:hidden transition-colors ${
                isScrolled
                  ? 'text-gray-900 dark:text-white'
                  : 'text-white hover:bg-white/10'
              }`}
              aria-label="Toggle Mobile Menu"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <div
        className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          mobileMenuOpen
            ? 'max-h-[90vh] overflow-y-auto bg-white dark:bg-darkBg shadow-2xl border-b dark:border-slate-800 opacity-100'
            : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 pt-3 pb-8 space-y-4">
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, 'home')}
            className="block font-bold text-base uppercase tracking-wider text-gray-900 dark:text-white hover:text-vibrantOrange"
          >
            Home
          </a>

          <a
            href="#services"
            onClick={(e) => handleLinkClick(e, 'services')}
            className="block font-bold text-base uppercase tracking-wider text-gray-900 dark:text-white hover:text-vibrantOrange"
          >
            Services
          </a>

          {/* Tools Accordion in Mobile */}
          <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-900/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
              className="w-full p-3.5 flex items-center justify-between font-bold text-base uppercase tracking-wider text-gray-900 dark:text-white"
            >
              <span className="flex items-center gap-2">
                <span>Free Online Tools</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-vibrantOrange text-white font-extrabold tracking-normal">
                  FREE
                </span>
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${mobileToolsOpen ? 'rotate-180 text-vibrantOrange' : ''}`}
              />
            </button>

            {mobileToolsOpen && (
              <div className="p-3 pt-0 space-y-4 border-t border-gray-100 dark:border-slate-800">
                {TOOL_SECTIONS.map((sec) => (
                  <div key={sec.title} className="space-y-1.5 pt-2">
                    <div className="text-[11px] font-black uppercase text-gray-400 tracking-wider flex items-center gap-1.5">
                      {sec.categoryIcon}
                      <span>{sec.title}</span>
                    </div>
                    {sec.items.map((item) => (
                      <div
                        key={item.name}
                        onClick={() => {
                          if (item.isAvailable && item.path) {
                            handleToolNavigate(item.path);
                          }
                        }}
                        className={`p-2 rounded-xl flex items-center justify-between text-xs font-semibold ${
                          item.isAvailable && item.path
                            ? 'cursor-pointer hover:bg-white dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200'
                            : 'opacity-50 text-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {item.icon}
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}

                <button
                  onClick={() => handleToolNavigate('/tools')}
                  className="w-full text-center py-2 text-xs font-bold text-royalBlue dark:text-blue-400 border-t border-gray-200 dark:border-slate-800 pt-3"
                >
                  View All 40+ Tools Directory →
                </button>
              </div>
            )}
          </div>

          <a
            href="#technology-stack"
            onClick={(e) => handleLinkClick(e, 'technology-stack')}
            className="block font-bold text-base uppercase tracking-wider text-gray-900 dark:text-white hover:text-vibrantOrange"
          >
            Tech
          </a>
          <a
            href="#process"
            onClick={(e) => handleLinkClick(e, 'process')}
            className="block font-bold text-base uppercase tracking-wider text-gray-900 dark:text-white hover:text-vibrantOrange"
          >
            Process
          </a>
          <a
            href="#our-clients"
            onClick={(e) => handleLinkClick(e, 'our-clients')}
            className="block font-bold text-base uppercase tracking-wider text-gray-900 dark:text-white hover:text-vibrantOrange"
          >
            Clients
          </a>
          <a
            href="#about"
            onClick={(e) => handleLinkClick(e, 'about')}
            className="block font-bold text-base uppercase tracking-wider text-gray-900 dark:text-white hover:text-vibrantOrange"
          >
            About
          </a>
          <a
            href="#contact-us"
            onClick={(e) => handleLinkClick(e, 'contact-us')}
            className="block font-bold text-base uppercase tracking-wider text-gray-900 dark:text-white hover:text-vibrantOrange"
          >
            Contact
          </a>

          <button
            onClick={(e) => handleLinkClick(e, 'contact-us')}
            className="w-full text-center bg-orange-gradient text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wider shadow-md active:scale-95 transition-all mt-4"
          >
            Free Consultation
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
