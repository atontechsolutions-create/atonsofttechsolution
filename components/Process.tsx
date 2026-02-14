
import React from 'react';

const ProcessStep: React.FC<{ num: number; title: string; desc: string; isLast?: boolean }> = ({ num, title, desc, isLast }) => (
  <div className="flex group">
    <div className="flex flex-col items-center mr-6 md:mr-10">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-gradient text-white font-bold text-xl shadow-lg relative z-10 group-hover:scale-110 transition-transform">
        {num}
      </div>
      {!isLast && <div className="w-1 flex-1 timeline-line my-2 opacity-30"></div>}
    </div>
    <div className="pb-12 pt-1">
      <h3 className="text-2xl font-bold text-deepBlue mb-2 font-display group-hover:text-royalBlue transition-colors">{title}</h3>
      <p className="text-gray-600 text-lg">{desc}</p>
    </div>
  </div>
);

const Process: React.FC = () => {
  const steps = [
    { title: "Research", desc: "Requirements gathering and market analysis to ensure project alignment." },
    { title: "Design", desc: "Detailed prototype creation and UI/UX planning for an intuitive experience." },
    { title: "Development", desc: "High-quality coding followed by rigorous multi-stage testing sessions." },
    { title: "Deployment", desc: "Strategic beta launch leading to full production go-live with zero downtime." },
    { title: "Maintenance", desc: "24/7 monitoring, security updates, and ongoing technical support." }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-4xl font-display font-bold text-deepBlue">Our Development Process</h2>
        <p className="text-gray-600 text-lg">A systematic approach to building excellence.</p>
      </div>

      <div className="relative">
        {steps.map((step, idx) => (
          <ProcessStep 
            key={idx} 
            num={idx + 1} 
            title={step.title} 
            desc={step.desc} 
            isLast={idx === steps.length - 1} 
          />
        ))}
      </div>
    </div>
  );
};

export default Process;
