
import React from 'react';
import { Quote } from 'lucide-react';

const TestimonialCard: React.FC<{ name: string; role: string; content: string; image: string }> = ({ name, role, content, image }) => (
  <div className="bg-white dark:bg-darkCard p-10 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-800 relative overflow-hidden">
    <Quote className="absolute top-4 right-4 text-blue-50 dark:text-slate-800/40" size={64} />
    <div className="relative z-10 space-y-6">
      <p className="text-gray-600 dark:text-gray-400 text-lg italic leading-relaxed">"{content}"</p>
      <div className="flex items-center space-x-4">
        <img 
          src={image} 
          alt={name} 
          className="w-14 h-14 rounded-full object-cover border-4 border-white dark:border-slate-900 shadow-md flex-shrink-0"
          referrerPolicy="no-referrer"
        />
        <div>
          <h4 className="font-bold text-deepBlue dark:text-white text-lg">{name}</h4>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{role}</p>
        </div>
      </div>
    </div>
  </div>
);

const Testimonials: React.FC = () => {
  const reviews = [
    { 
      name: "Rajesh Kumar", 
      role: "CEO, BazaarHub", 
      image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200&h=200",
      content: "ATON TECH Solutions transformed our complex supply chain into a seamless digital experience. Their attention to detail in the dashboard system was phenomenal." 
    },
    { 
      name: "Sneha Reddy", 
      role: "Director, NayaUday", 
      image: "https://images.unsplash.com/photo-1614283233556-f35b0c801ef1?auto=format&fit=crop&q=80&w=200&h=200",
      content: "The level of expertise in AI automation they brought to the table helped us reduce operational costs by 40% within the first six months." 
    },
    { 
      name: "Amit Patel", 
      role: "CTO, ChakraSync", 
      image: "https://images.unsplash.com/photo-1624561172888-ac93c696e10c?auto=format&fit=crop&q=80&w=200&h=200",
      content: "Responsive, professional, and highly skilled. They didn't just build a website; they built a powerful business engine for our startup." 
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-display font-bold text-deepBlue dark:text-white mb-4">What Our Clients Say</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">Real feedback from real success stories.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {reviews.map((r, i) => (
          <TestimonialCard key={i} {...r} />
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
