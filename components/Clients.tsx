
import React from 'react';
import { Star } from 'lucide-react';

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
          {[
            { name: 'Rajesh Kumar', role: 'CEO, RetailHub', rating: 5, image: 'https://i.pravatar.cc/200?u=rajesh' },
            { name: 'Priya Sharma', role: 'Founder, EcoStyle', rating: 5, image: 'https://i.pravatar.cc/200?u=priya' },
            { name: 'Amit Patel', role: 'CTO, DataSync', rating: 4, image: 'https://i.pravatar.cc/200?u=amit' },
            { name: 'Sneha Reddy', role: 'Director, Innovate', rating: 5, image: 'https://i.pravatar.cc/200?u=sneha' },
            { name: 'Vikram Singh', role: 'Manager, GlobalOps', rating: 5, image: 'https://i.pravatar.cc/200?u=vikram' },
            { name: 'Anjali Gupta', role: 'Lead, CreativeCo', rating: 4, image: 'https://i.pravatar.cc/200?u=anjali' },
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
