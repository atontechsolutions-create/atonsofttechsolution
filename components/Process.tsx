
import React, { useState, useEffect, useRef } from 'react';

const steps = [
  { title: "Research", desc: "Requirements gathering and market analysis to ensure project alignment." },
  { title: "Design", desc: "Detailed prototype creation and UI/UX planning for an intuitive experience." },
  { title: "Development", desc: "High-quality coding followed by rigorous multi-stage testing sessions." },
  { title: "Deployment", desc: "Strategic beta launch leading to full production go-live with zero downtime." },
  { title: "Maintenance", desc: "24/7 monitoring, security updates, and ongoing technical support." }
];

interface ProcessStepProps {
  num: number;
  title: string;
  desc: string;
  isLast?: boolean;
  isActive: boolean;
  setRef: (el: HTMLDivElement | null) => void;
}

const ProcessStep: React.FC<ProcessStepProps> = ({ num, title, desc, isLast, isActive, setRef }) => (
  <div ref={setRef} className="flex group">
    <div className="flex flex-col items-center mr-6 md:mr-10">
      <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl relative z-10 transition-all duration-500 ease-out ${
        isActive 
          ? 'bg-blue-gradient text-white scale-110 shadow-[0_0_15px_rgba(30,94,255,0.4)] ring-4 ring-royalBlue/20 border-transparent' 
          : 'bg-gray-100 text-gray-400 border-2 border-gray-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 shadow-none'
      }`}>
        {num}
      </div>
      {!isLast && (
        <div className="w-1 flex-1 my-2 bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden min-h-[50px] relative">
          <div 
            className="absolute top-0 left-0 w-full h-full timeline-line transition-all duration-500 origin-top ease-out" 
            style={{ 
              transform: isActive ? 'scaleY(1)' : 'scaleY(0)',
              opacity: isActive ? 1 : 0 
            }}
          />
        </div>
      )}
    </div>
    <div className="pb-12 pt-1 flex-1">
      <h3 className={`text-xl sm:text-2xl font-bold mb-2 font-display transition-all duration-500 ${
        isActive 
          ? 'text-deepBlue dark:text-white scale-[1.02] origin-left' 
          : 'text-gray-400 dark:text-slate-600'
      }`}>
        {title}
      </h3>
      <p className={`text-base sm:text-lg transition-all duration-500 leading-relaxed ${
        isActive 
          ? 'text-gray-600 dark:text-gray-400' 
          : 'text-gray-400 dark:text-slate-700'
      }`}>
        {desc}
      </p>
    </div>
  </div>
);

const Process: React.FC = () => {
  const [activeSteps, setActiveSteps] = useState<boolean[]>([false, false, false, false, false]);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const updated = steps.map((_, idx) => {
        const el = stepRefs.current[idx];
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        // Step becomes active once its top part crosses 75% of the viewport height.
        return rect.top < window.innerHeight * 0.75;
      });

      setActiveSteps((prev) => {
        const changed = prev.some((val, idx) => val !== updated[idx]);
        return changed ? updated : prev;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run immediately on mount to capture the initial view state
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-deepBlue dark:text-white">Our Development Process</h2>
        <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg">A systematic approach to building excellence.</p>
      </div>

      <div className="relative">
        {steps.map((step, idx) => (
          <ProcessStep 
            key={idx} 
            num={idx + 1} 
            title={step.title} 
            desc={step.desc} 
            isLast={idx === steps.length - 1} 
            isActive={activeSteps[idx]}
            setRef={(el) => {
              stepRefs.current[idx] = el;
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Process;
