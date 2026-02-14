
import React from 'react';

const StatBox: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="text-center p-8 bg-blue-50 rounded-3xl border border-blue-100 hover:shadow-lg transition-shadow">
    <div className="text-4xl md:text-5xl font-display font-extrabold text-royalBlue mb-2">{value}</div>
    <div className="text-gray-600 font-medium">{label}</div>
  </div>
);

const Clients: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-8">
          <h2 className="text-4xl font-display font-bold text-deepBlue">Trusted by Visionaries</h2>
          <p className="text-gray-600 text-lg leading-relaxed">
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
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center p-8 grayscale hover:grayscale-0 transition-all cursor-pointer border border-gray-100">
               <div className="text-gray-300 font-display font-bold text-2xl">LOGO {i}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Clients;
