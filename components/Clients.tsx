
import React, { useState, useEffect, useRef } from 'react';
import { Star } from 'lucide-react';

const StatBox: React.FC<{ label: string; value: string }> = ({ label, value }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  const numericMatch = value.match(/^(\d+)(.*)$/);
  const targetNumber = numericMatch ? parseInt(numericMatch[1], 10) : 0;
  const suffix = numericMatch ? numericMatch[2] : '';

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTime: number | null = null;
          const duration = 1000; // Animation finishes beautifully and fast in 1000ms

          const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easedProgress = progress * (2 - progress); // Eased out quadratic
            setDisplayValue(Math.floor(easedProgress * targetNumber));

            if (progress < 1) {
              requestAnimationFrame(animate);
            } else {
              setDisplayValue(targetNumber);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [targetNumber]);

  return (
    <div ref={containerRef} className="text-center p-8 bg-blue-50 dark:bg-slate-800/50 rounded-3xl border border-blue-100 dark:border-slate-800 hover:shadow-lg transition-all">
      <div className="text-4xl md:text-5xl font-display font-extrabold text-royalBlue dark:text-blue-400 mb-2">
        {displayValue}{suffix}
      </div>
      <div className="text-gray-600 dark:text-gray-300 font-medium">{label}</div>
    </div>
  );
};

const Clients: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <h2 className="text-4xl font-display font-bold text-deepBlue dark:text-white">Trusted by Visionaries</h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            We proudly collaborate with startups, SMEs, and enterprises across diverse industries. Our commitment to excellence has helped us build long-term partnerships worldwide.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <StatBox label="Projects Completed" value="250+" />
            <StatBox label="Happy Clients" value="180+" />
            <StatBox label="Years Experience" value="8+" />
            <StatBox label="Team Experts" value="45+" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          {[
            { name: 'Rajesh Kumar', role: 'CEO, BazaarHub', rating: 5, image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200&h=200' },
            { name: 'Priya Sharma', role: 'Founder, AyurStyle', rating: 5, image: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200&h=200' },
            { name: 'Amit Patel', role: 'CTO, ChakraSync', rating: 4, image: 'https://images.unsplash.com/photo-1624561172888-ac93c696e10c?auto=format&fit=crop&q=80&w=200&h=200' },
            { name: 'Sneha Reddy', role: 'Director, NayaUday', rating: 5, image: 'https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?auto=format&fit=crop&q=80&w=200&h=200' },
            { name: 'Vikram Singh', role: 'Manager, BharatOps', rating: 5, image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=200&h=200' },
            { name: 'Anjali Gupta', role: 'Lead, KalaKriti', rating: 4, image: 'https://images.unsplash.com/photo-1607746882042-944635dfe10e?auto=format&fit=crop&q=80&w=200&h=200' },
          ].map((customer) => (
            <div key={customer.name} className="bg-white dark:bg-slate-800 rounded-3xl p-6 flex flex-col items-center text-center space-y-4 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group">
              <div className="relative">
                <div className="absolute inset-0 bg-orange-gradient rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>
                <img 
                  src={customer.image} 
                  alt={customer.name} 
                  className="w-20 h-20 rounded-full object-cover border-4 border-white dark:border-slate-900 relative z-10"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="font-bold text-deepBlue dark:text-white text-lg">{customer.name}</h4>
                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-widest">{customer.role}</p>
              </div>
              <div className="flex space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    className={i < customer.rating ? "fill-vibrantOrange text-vibrantOrange" : "text-gray-300 dark:text-slate-600"} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Clients;
