
import React from 'react';
import { ShoppingBag, LayoutDashboard, BrainCircuit, CheckCircle2 } from 'lucide-react';

const ServiceCard: React.FC<{ title: string; items: string[]; icon: React.ReactNode }> = ({ title, items, icon }) => (
  <div className="service-card relative group p-8 bg-white dark:bg-darkCard rounded-3xl shadow-lg border border-gray-100 dark:border-slate-800 hover:border-royalBlue/30 transition-all duration-500 overflow-hidden">
    <div className="glow absolute inset-0 opacity-0 pointer-events-none rounded-3xl bg-blue-500/5"></div>
    <div className="relative z-10">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-royalBlue flex items-center justify-center mb-6 group-hover:bg-royalBlue group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-deepBlue dark:text-white mb-6 font-display">{title}</h3>
      <ul className="space-y-4">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
            <CheckCircle2 size={18} className="text-vibrantOrange mr-3 flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const Services: React.FC = () => {
  const serviceList = [
    {
      title: "E-Commerce & Online Selling",
      icon: <ShoppingBag size={32} />,
      items: [
        "Custom E-commerce Website",
        "Multi-Vendor Marketplace",
        "Subscription Platform",
        "B2B Portal",
        "Online Ordering System",
        "Payment Gateway Integration"
      ]
    },
    {
      title: "Web-Based Business Apps",
      icon: <LayoutDashboard size={32} />,
      items: [
        "Admin Dashboard Systems",
        "Vendor Management System",
        "Franchise Management Software",
        "Online Booking System",
        "Appointment Scheduling",
        "Lead Management System",
        "Support Ticket System"
      ]
    },
    {
      title: "Enterprise & Advanced Solutions",
      icon: <BrainCircuit size={32} />,
      items: [
        "AI-Based Business Tools",
        "Data Analytics Dashboard",
        "Business Intelligence Systems",
        "Custom Reporting Software",
        "Workflow Automation Systems"
      ]
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-4xl md:text-5xl font-display font-bold text-deepBlue dark:text-white">Expertise We Deliver</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
          Specialized solutions tailored for modern enterprises and fast-growing startups.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {serviceList.map((service, idx) => (
          <ServiceCard key={idx} {...service} />
        ))}
      </div>
    </div>
  );
};

export default Services;
