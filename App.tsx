
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
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

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

  // Global smooth scroll handler
  const handleScrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className={`relative min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-darkBg text-gray-100' : 'bg-white text-gray-900'}`}>
      <Toaster position="top-right" />
      <Navbar 
        isScrolled={isScrolled} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme} 
        onNavigate={handleScrollToSection}
      />
      
      <main>
        <section id="home">
          <Hero onNavigate={handleScrollToSection} />
        </section>
        
        <section id="about" className="py-20 bg-white dark:bg-darkBg">
          <About />
        </section>
        
        <section id="services" className="py-20 bg-gray-50 dark:bg-slate-900/50">
          <Services />
        </section>
        
        <section id="process" className="py-20 bg-white dark:bg-darkBg">
          <Process />
        </section>
        
        <section id="technology-stack" className="py-20 bg-gray-50 dark:bg-slate-900/50">
          <TechStack />
        </section>
        
        <section id="our-clients" className="py-20 bg-white dark:bg-darkBg">
          <Clients />
        </section>
        
        <section id="why-choose-us" className="py-20 bg-gray-900 text-white">
          <WhyChooseUs />
        </section>
        
        <section id="testimonials" className="py-20 bg-gray-50 dark:bg-slate-900/50">
          <Testimonials />
        </section>
        
        <section id="contact-us" className="py-20 bg-white dark:bg-darkBg">
          <Contact />
        </section>

        <section className="py-16 bg-blue-gradient text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-display">Ready to Build Your Digital Future?</h2>
            <p className="text-lg opacity-90 mb-8">Let's discuss how we can transform your business with our expertise.</p>
            <button 
              onClick={() => handleScrollToSection('contact-us')}
              className="inline-block px-10 py-4 rounded-full bg-orange-gradient text-white font-bold text-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Get Free Consultation
            </button>
          </div>
        </section>
      </main>

      <Footer onNavigate={handleScrollToSection} />
      <FloatingWhatsApp />
    </div>
  );
};

export default App;
