
import React from 'react';
import { Layers, Zap, Shield, Clock, IndianRupee, Headset } from 'lucide-react';

const FeatureItem: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-vibrantOrange/50 transition-all group">
    <div className="w-14 h-14 rounded-2xl bg-royalBlue/20 text-royalBlue flex items-center justify-center mb-6 group-hover:bg-vibrantOrange group-hover:text-white transition-all">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 font-display">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

const WhyChooseUs: React.FC = () => {
  const features = [
    { icon: <Layers />, title: "Custom-Built Solutions", desc: "Tailored software that fits your unique business requirements perfectly." },
    { icon: <Zap />, title: "Scalable Architecture", desc: "Built with the future in mind, supporting your growth from day one." },
    { icon: <Shield />, title: "Secure & Reliable", desc: "Top-tier security protocols and redundant systems for maximum uptime." },
    { icon: <Clock />, title: "On-Time Delivery", desc: "Strict adherence to timelines through agile methodologies." },
    { icon: <IndianRupee />, title: "Affordable Pricing", desc: "Premium quality solutions at competitive market rates." },
    { icon: <Headset />, title: "Dedicated Support", desc: "24/7 technical assistance and maintenance from our expert team." }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-display font-bold text-white mb-4">Why Businesses Trust Us</h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">Discover the ATON TECH advantage.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <FeatureItem key={i} {...f} />
        ))}
      </div>
    </div>
  );
};

export default WhyChooseUs;
