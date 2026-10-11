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
import PhotoResizer from './components/tools/PhotoResizer';
import SignatureResizer from './components/tools/SignatureResizer';
import PhotoSignatureResizer from './components/tools/PhotoSignatureResizer';
import PassportPhotoMaker from './components/tools/PassportPhotoMaker';
import IndianExamResizer from './components/tools/IndianExamResizer';
import PhotoCompressorKb from './components/tools/PhotoCompressorKb';
import SignatureCompressorTargetKb from './components/tools/SignatureCompressorTargetKb';
import PhotoBackgroundChanger from './components/tools/PhotoBackgroundChanger';
import SignatureBackgroundRemover from './components/tools/SignatureBackgroundRemover';
import OnlineSignatureMaker from './components/tools/OnlineSignatureMaker';
import WhiteBackgroundMaker from './components/tools/WhiteBackgroundMaker';
import ImageCropper from './components/tools/ImageCropper';
import ImageRotator from './components/tools/ImageRotator';
import ImageBrightnessContrast from './components/tools/ImageBrightnessContrast';
import MultiplePassportPhotosPage from './components/tools/MultiplePassportPhotosPage';
import PhotoSignatureFormatConverter from './components/tools/PhotoSignatureFormatConverter';
import ImageDpiChecker from './components/tools/ImageDpiChecker';
import ImageDimensionsChecker from './components/tools/ImageDimensionsChecker';
import ImageCompressor from './components/tools/ImageCompressor';
import ImageConverter from './components/tools/ImageConverter';
import ToolsIndex from './components/tools/ToolsIndex';
import MicrophoneTester from './components/tools/MicrophoneTester';
import CameraTester from './components/tools/CameraTester';
import ImageToPdfConverter from './components/tools/ImageToPdfConverter';
import PdfToolWorkspace from './components/tools/PdfToolWorkspace';
import { getPdfToolBySlug } from './components/tools/pdfToolsData';
import QrCodeGenerator from './components/tools/QrCodeGenerator';
import InternetSpeedTest from './components/tools/InternetSpeedTest';
import WordCounter from './components/tools/WordCounter';
import TextCaseConverter from './components/tools/TextCaseConverter';
import PasswordGenerator from './components/tools/PasswordGenerator';
import SpeakerTester from './components/tools/SpeakerTester';
import ScreenResolutionChecker from './components/tools/ScreenResolutionChecker';
import DeadPixelTester from './components/tools/DeadPixelTester';
import KeyboardTester from './components/tools/KeyboardTester';
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
  // Section A: Photo & Signature Tools (Independent routes)
  const isPhotoResizer = normalizedPath === '/tools/photo-resizer';
  const isSignatureResizer = normalizedPath === '/tools/signature-resizer';
  const isPhotoSignatureResizer =
    normalizedPath === '/tools/photo-signature-resizer' ||
    normalizedPath === '/tools/photo-and-signature-resizer';
  const isPassportMaker = normalizedPath === '/tools/passport-photo-maker';
  const isIndianExamResizer = normalizedPath === '/tools/indian-exam-resizer';
  const isPhotoCompressor20Kb = normalizedPath === '/tools/photo-compressor-20kb';
  const isPhotoCompressor50Kb = normalizedPath === '/tools/photo-compressor-50kb';
  const isPhotoCompressor100Kb = normalizedPath === '/tools/photo-compressor-100kb';
  const isSignatureCompressor =
    normalizedPath === '/tools/signature-compressor' ||
    normalizedPath === '/tools/signature-compressor-target-kb';
  const isPhotoBgChanger =
    normalizedPath === '/tools/photo-background-changer' ||
    normalizedPath === '/tools/photo-bg-changer';
  const isWhiteBgMaker = normalizedPath === '/tools/white-background-maker';
  const isImageCropper = normalizedPath === '/tools/image-cropper';
  const isImageRotator = normalizedPath === '/tools/image-rotator';
  const isImageBrightness =
    normalizedPath === '/tools/image-brightness-adjuster' ||
    normalizedPath === '/tools/image-brightness-contrast';
  const isMultiplePassportPhotos = normalizedPath === '/tools/multiple-passport-photos-page';
  const isPhotoSigFormatConverter = normalizedPath === '/tools/photo-signature-format-converter';
  const isImageDpiChecker = normalizedPath === '/tools/image-dpi-checker';
  const isImageDimensionsChecker = normalizedPath === '/tools/image-dimensions-checker';

  // Section B: Image Tools
  const isImageCompressor = normalizedPath === '/tools/image-compressor';
  
  // PDF Suite Tools (Convert & Organize 45 tools)
  const currentSlugWithoutTools = normalizedPath.startsWith('/tools/')
    ? normalizedPath.replace('/tools/', '')
    : '';

  // Specific Image-to-PDF tools: Dedicated independent converter
  const isImageToPdf =
    normalizedPath === '/tools/image-to-pdf' ||
    normalizedPath === '/tools/jpg-to-pdf' ||
    normalizedPath === '/tools/png-to-pdf' ||
    normalizedPath === '/tools/webp-to-pdf' ||
    normalizedPath === '/tools/heic-to-pdf';

  const matchedPdfTool = !isImageToPdf ? getPdfToolBySlug(currentSlugWithoutTools) : undefined;
  const isPdfTool = Boolean(matchedPdfTool);

  const isImageConverter =
    !isPdfTool &&
    !isImageToPdf &&
    (normalizedPath === '/tools/image-converter' ||
      /^\/tools\/[a-z0-9]+-to-[a-z0-9]+$/.test(normalizedPath));
  const converterSlug = isImageConverter
    ? normalizedPath.replace('/tools/', '')
    : 'image-converter';
  const isToolsIndex = normalizedPath === '/tools';

  // Newly implemented tools routes
  const isMicTester = normalizedPath === '/tools/mic-tester';
  const isCameraTester = normalizedPath === '/tools/webcam-tester';
  const isQrCode = normalizedPath === '/tools/qr-code-generator';
  const isSpeedTest = normalizedPath === '/tools/internet-speed-test';
  const isWordCounter = normalizedPath === '/tools/word-counter';
  const isTextCase = normalizedPath === '/tools/text-case-converter';
  const isPasswordGen = normalizedPath === '/tools/password-generator';
  const isSpeakerTester = normalizedPath === '/tools/speaker-tester';
  const isScreenRes = normalizedPath === '/tools/screen-resolution-checker';
  const isDeadPixel = normalizedPath === '/tools/dead-pixel-test';
  const isKeyboardTester = normalizedPath === '/tools/keyboard-tester';
  const isIpChecker = normalizedPath === '/tools/ip-checker';
  const isRemoveDupes = normalizedPath === '/tools/remove-duplicate-lines';
  const isSignatureBgRemover =
    normalizedPath === '/tools/signature-background-remover' ||
    normalizedPath === '/tools/signature-bg-remover';
  const isSignatureMaker =
    normalizedPath === '/tools/online-signature-maker' ||
    normalizedPath === '/tools/signature-maker';

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

      {isPhotoResizer ? (
        <main className="pt-24 sm:pt-28">
          <PhotoResizer
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isSignatureResizer ? (
        <main className="pt-24 sm:pt-28">
          <SignatureResizer
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
      ) : isPassportMaker ? (
        <main className="pt-24 sm:pt-28">
          <PassportPhotoMaker
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isIndianExamResizer ? (
        <main className="pt-24 sm:pt-28">
          <IndianExamResizer
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isPhotoCompressor20Kb ? (
        <main className="pt-24 sm:pt-28">
          <PhotoCompressorKb
            targetKbDefault={20}
            titleOverride="Photo Compressor to 20 KB"
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isPhotoCompressor50Kb ? (
        <main className="pt-24 sm:pt-28">
          <PhotoCompressorKb
            targetKbDefault={50}
            titleOverride="Photo Compressor to 50 KB"
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isPhotoCompressor100Kb ? (
        <main className="pt-24 sm:pt-28">
          <PhotoCompressorKb
            targetKbDefault={100}
            titleOverride="Photo Compressor to 100 KB"
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isSignatureCompressor ? (
        <main className="pt-24 sm:pt-28">
          <SignatureCompressorTargetKb
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isPhotoBgChanger ? (
        <main className="pt-24 sm:pt-28" key="photo-bg-changer">
          <PhotoBackgroundChanger
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isSignatureBgRemover ? (
        <main className="pt-24 sm:pt-28" key="signature-bg-remover">
          <SignatureBackgroundRemover
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isSignatureMaker ? (
        <main className="pt-24 sm:pt-28" key="online-signature-maker">
          <OnlineSignatureMaker
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isWhiteBgMaker ? (
        <main className="pt-24 sm:pt-28">
          <WhiteBackgroundMaker
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isImageCropper ? (
        <main className="pt-24 sm:pt-28">
          <ImageCropper
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isImageRotator ? (
        <main className="pt-24 sm:pt-28">
          <ImageRotator
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isImageBrightness ? (
        <main className="pt-24 sm:pt-28">
          <ImageBrightnessContrast
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isMultiplePassportPhotos ? (
        <main className="pt-24 sm:pt-28">
          <MultiplePassportPhotosPage
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isPhotoSigFormatConverter ? (
        <main className="pt-24 sm:pt-28">
          <PhotoSignatureFormatConverter
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isImageDpiChecker ? (
        <main className="pt-24 sm:pt-28">
          <ImageDpiChecker
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isImageDimensionsChecker ? (
        <main className="pt-24 sm:pt-28">
          <ImageDimensionsChecker
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
            activeSlug={converterSlug}
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
      ) : isPdfTool ? (
        <main className="pt-24 sm:pt-28" key={`pdf-tool-${currentSlugWithoutTools}`}>
          <PdfToolWorkspace
            toolSlug={currentSlugWithoutTools}
            onNavigateHome={handleScrollToSection}
            onNavigateToTool={navigateToRoute}
          />
        </main>
      ) : isImageToPdf ? (
        <main className="pt-24 sm:pt-28" key={`image-to-pdf-${normalizedPath}`}>
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
      ) : isKeyboardTester ? (
        <main className="pt-24 sm:pt-28">
          <KeyboardTester
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
