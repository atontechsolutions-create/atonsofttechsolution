
import React from 'react';
import { Quote } from 'lucide-react';

const TestimonialCard: React.FC<{ name: string; role: string; content: string }> = ({ name, role, content }) => (
  <div className="bg-white p-10 rounded-3xl shadow-lg border border-gray-100 relative">
    <Quote className="absolute top-8 right-8 text-blue-50" size={64} />
    <div className="relative z-10 space-y-6">
      <p className="text-gray-600 text-lg italic leading-relaxed">"{content}"</p>
      <div className="flex items-center space-x-4">
        <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center font-bold text-royalBlue text-xl uppercase">
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold text-deepBlue text-lg">{name}</h4>
          <p className="text-gray-500 text-sm">{role}</p>
        </div>
      </div>
    </div>
  </div>
);

const Testimonials: React.FC = () => {
  const reviews = [
    { name: "John Smith", role: "CEO, RetailHub", content: "ATON TECH transformed our complex supply chain into a seamless digital experience. Their attention to detail in the dashboard system was phenomenal." },
    { name: "Sarah Williams", role: "Product Manager, FintechX", content: "The level of expertise in AI automation they brought to the table helped us reduce operational costs by 40% within the first six months." },
    { name: "Michael Chen", role: "Founder, GreenSpace", content: "Responsive, professional, and highly skilled. They didn't just build a website; they built a powerful business engine for our startup." }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-display font-bold text-deepBlue mb-4">What Our Clients Say</h2>
        <p className="text-gray-600 text-lg">Real feedback from real success stories.</p>
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
