
import React from 'react';
import { Target, ShieldCheck } from 'lucide-react';

const About: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800&h=600" 
            alt="ATON TECH Solutions" 
            className="rounded-3xl shadow-2xl relative z-10"
          />
          <div className="absolute -bottom-6 -right-6 w-full h-full border-4 border-vibrantOrange rounded-3xl -z-0"></div>
        </div>

        <div className="space-y-8">
          <div className="inline-block px-4 py-1.5 rounded-full bg-orange-50 dark:bg-orange-900/20 text-vibrantOrange font-bold text-sm uppercase tracking-wider border border-orange-100 dark:border-orange-900/30">
            About ATON TECH
          </div>
          <h2 className="text-4xl font-display font-bold text-deepBlue dark:text-white">
            Our <span className="text-royalBlue">Journey</span>
          </h2>
          <div className="space-y-4 text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            <p>
              In 2017, three brothers with a strong passion for computers dreamed of building something big in technology. We did not have enough money to buy a computer, so we saved and purchased an assembled one. After some time, it stopped working. Instead of giving up, we used jugad and self-learning to repair it ourselves. That was the moment our real journey started.
            </p>
            <p>
              Slowly, we learned hardware and then moved to software. During college, we started learning coding seriously and joined internships to gain practical experience in building websites and software. In 2020, we also started a tech YouTube channel to share our knowledge.
            </p>
            <p>
              With continuous learning and hard work, today all three of us are software developers. We founded Aton Tech Solutions and have built software for small shops as well as large companies.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 pt-4">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-royalBlue flex-shrink-0">
                <Target size={24} />
              </div>
              <div>
                <h4 className="font-bold text-deepBlue dark:text-white text-xl mb-1">Our Mission</h4>
                <p className="text-gray-600 dark:text-gray-400">To deliver innovative, secure, and scalable digital solutions that drive measurable business growth.</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-vibrantOrange flex-shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h4 className="font-bold text-deepBlue dark:text-white text-xl mb-1">Our Vision</h4>
                <p className="text-gray-600 dark:text-gray-400">To be the global leader in digital transformation, setting benchmarks for excellence and secure architectures.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
