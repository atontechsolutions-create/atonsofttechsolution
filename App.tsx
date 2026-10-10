import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Process from './components/Process';
import TechStack from './components/TechStack';
import Clients from './components/Clients';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import PhotoSignatureResizer from './components/tools/PhotoSignatureResizer';
import SignatureResizer from './components/tools/SignatureResizer';
import ImageCompressor from './components/tools/ImageCompressor';
import ImageConverter from './components/tools/ImageConverter';
import ToolsIndex from './components/tools/ToolsIndex';
import MicrophoneTester from './components/tools/MicrophoneTester';
import CameraTester from './components/tools/CameraTester';
import ImageToPdfConverter from './components/tools/ImageToPdfConverter';
import QrCodeGenerator from './components/tools/QrCodeGenerator';
import InternetSpeedTest from './components/tools/InternetSpeedTest';
import WordCounter from './components/tools/WordCounter';
import TextCaseConverter from './components/tools/TextCaseConverter';
import PasswordGenerator from './components/tools/PasswordGenerator';
import SpeakerTester from './components/tools/SpeakerTester';
import ScreenResolutionChecker from './components/tools/ScreenResolutionChecker';
import DeadPixelTester from './components/tools/DeadPixelTester';
import IpChecker from './components/tools/IpChecker';
import RemoveDuplicates from './components/tools/RemoveDuplicates';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });

  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return (
        localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
      );
    }
    return false;
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const navigateToRoute = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Global smooth scroll handler
  const handleScrollToSection = (id: string = 'home') => {
    if (currentPath !== '/') {
      window.history.pushState({}, '', '/');
      setCurrentPath('/');
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
          });
        }
      }, 100);
      return;
    }

    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Route matches
  const normalizedPath = currentPath.replace(/\/+$/, '') || '/';
  const isSignatureResizer = normalizedPath === '/tools/signature-resizer';
  const isImageCompressor = normalizedPath === '/tools/image-compressor';
  const isImageConverter = normalizedPath === '/tools/image-converter';
  const isPhotoSignatureResizer =
    normalizedPath === '/tools/photo-signature-resizer' || normalizedPath === '/tools/photo-resizer';
  const isToolsIndex = normalizedPath === '/tools';

  // Newly implemented tools routes
  const isMicTester = normalizedPath === '/tools/mic-tester';
  const isCameraTester = normalizedPath === '/tools/webcam-tester';
  const isImageToPdf = normalizedPath === '/tools/image-to-pdf';
  const isQrCode = normalizedPath === '/tools/qr-code-generator';
  const isSpeedTest = normalizedPath === '/tools/internet-speed-test';
  const isWordCounter = normalizedPath === '/tools/word-counter';
  const isTextCase = normalizedPath === '/tools/text-case-converter';
  const isPasswordGen = normalizedPath === '/tools/password-generator';
  const isSpeakerTester = normalizedPath === '/tools/speaker-tester';
  const isScreenRes = normalizedPath === '/tools/screen-resolution-checker';
  const isDeadPixel = normalizedPath === '/tools/dead-pixel-test';
  const isIpChecker = normalizedPath === '/tools/ip-checker';
  const isRemoveDupes = normalizedPath === '/tools/remove-duplicate-lines';

  return (
    <div
      className={`relative w-full max-w-full overflow-x-hidden min-h-screen transition-colors duration-300 ${
        isDarkMode ? 'bg-darkBg text-gray-100' : 'bg-white text-gray-900'
      }`}
    >
      <Toaster position="top-right" />
      <Navbar
        isScrolled={isScrolled || currentPath !== '/'}
        isDarkMode={isDarkMode}
        toggleTheme={toggleTheme}
        onNavigate={handleScrollToSection}
        currentPath={currentPath}
        onNavigateRoute={navigateToRoute}
      />

      {isSignatureResizer ? (
        <main className="pt-24 sm:pt-28">
          <SignatureResizer
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isImageCompressor ? (
        <main className="pt-24 sm:pt-28">
          <ImageCompressor
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isImageConverter ? (
        <main className="pt-24 sm:pt-28">
          <ImageConverter
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isPhotoSignatureResizer ? (
        <main className="pt-24 sm:pt-28">
          <PhotoSignatureResizer
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isMicTester ? (
        <main className="pt-24 sm:pt-28">
          <MicrophoneTester
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isCameraTester ? (
        <main className="pt-24 sm:pt-28">
          <CameraTester
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isImageToPdf ? (
        <main className="pt-24 sm:pt-28">
          <ImageToPdfConverter
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isQrCode ? (
        <main className="pt-24 sm:pt-28">
          <QrCodeGenerator
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isSpeedTest ? (
        <main className="pt-24 sm:pt-28">
          <InternetSpeedTest
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isWordCounter ? (
        <main className="pt-24 sm:pt-28">
          <WordCounter
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isTextCase ? (
        <main className="pt-24 sm:pt-28">
          <TextCaseConverter
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isPasswordGen ? (
        <main className="pt-24 sm:pt-28">
          <PasswordGenerator
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isSpeakerTester ? (
        <main className="pt-24 sm:pt-28">
          <SpeakerTester
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isScreenRes ? (
        <main className="pt-24 sm:pt-28">
          <ScreenResolutionChecker
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isDeadPixel ? (
        <main className="pt-24 sm:pt-28">
          <DeadPixelTester
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isIpChecker ? (
        <main className="pt-24 sm:pt-28">
          <IpChecker
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isRemoveDupes ? (
        <main className="pt-24 sm:pt-28">
          <RemoveDuplicates
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isToolsIndex ? (
        <main className="pt-24 sm:pt-28">
          <ToolsIndex
            onNavigateToTool={navigateToRoute}
            onNavigateHome={handleScrollToSection}
          />
        </main>
      ) : (
        <main>
          <section id="home">
            <Hero onNavigate={handleScrollToSection} />
          </section>

          <section
            id="services"
            className="pt-12 pb-6 md:pt-20 md:pb-10 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-800/30"
          >
            <Services />
          </section>

          <section
            id="technology-stack"
            className="pt-6 pb-12 md:pt-10 md:pb-20 bg-white dark:bg-darkBg"
          >
            <TechStack />
          </section>

          <section
            id="process"
            className="py-12 md:py-20 bg-gray-50 dark:bg-slate-900/50 border-y border-gray-100 dark:border-slate-800/30"
          >
            <Process />
          </section>

          <section id="our-clients" className="py-12 md:py-20 bg-white dark:bg-darkBg">
            <Clients />
          </section>

          <section
            id="why-choose-us"
            className="py-12 md:py-20 bg-gray-50 dark:bg-slate-900/50 border-y border-gray-100 dark:border-slate-800/30"
          >
            <WhyChooseUs />
          </section>

          <section
            id="testimonials"
            className="py-12 md:py-20 bg-white dark:bg-darkBg overflow-hidden"
          >
            <Testimonials />
          </section>

          <section
            id="about"
            className="py-12 md:py-20 bg-gray-50 dark:bg-slate-900/50 border-y border-gray-100 dark:border-slate-800/30"
          >
            <About />
          </section>

          <section id="contact-us" className="py-12 md:py-20 bg-white dark:bg-darkBg">
            <Contact />
          </section>

          {/* Consultation CTA Banner */}
          <section className="py-16 md:py-24 bg-blue-gradient text-white text-center">
            <div className="max-w-4xl mx-auto px-4">
              <h2 className="text-3xl md:text-5xl font-black mb-6 font-display tracking-tight">
                Ready to Accelerate Your Digital Transformation?
              </h2>
              <p className="text-lg opacity-90 mb-8">
                Let's discuss how we can transform your business with our expertise.
              </p>
              <button
                onClick={() => handleScrollToSection('contact-us')}
                className="inline-block px-10 py-4 rounded-full bg-orange-gradient text-white font-bold text-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                Get Free Consultation
              </button>
            </div>
          </section>
        </main>
      )}

      <Footer onNavigate={handleScrollToSection} onNavigateRoute={navigateToRoute} />
      <FloatingWhatsApp />
    </div>
  );
};

export default App;
