
import React from 'react';

const TechCategory: React.FC<{ title: string; techs: string[] }> = ({ title, techs }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <h4 className="font-bold text-gray-400 uppercase text-sm tracking-widest mb-6">{title}</h4>
    <div className="flex flex-wrap gap-3">
      {techs.map((tech) => (
        <span key={tech} className="px-4 py-2 bg-blue-50 text-royalBlue rounded-lg font-semibold border border-blue-100 hover:bg-royalBlue hover:text-white transition-colors cursor-default">
          {tech}
        </span>
      ))}
    </div>
  </div>
);

const TechStack: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-display font-bold text-deepBlue mb-4">Our Technology Stack</h2>
        <p className="text-gray-600 text-lg">We use the most modern and reliable technologies to build your future.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <TechCategory title="Frontend" techs={['HTML5', 'CSS3', 'JavaScript', 'React', 'TypeScript', 'Tailwind CSS']} />
        <TechCategory title="Backend" techs={['Node.js', 'PHP', 'Python', 'Go', 'Express']} />
        <TechCategory title="Database" techs={['MySQL', 'MongoDB', 'PostgreSQL', 'Redis']} />
        <TechCategory title="Cloud & Integration" techs={['AWS', 'Firebase', 'GitHub', 'Razorpay', 'Stripe', 'Docker']} />
      </div>
    </div>
  );
};

export default TechStack;
