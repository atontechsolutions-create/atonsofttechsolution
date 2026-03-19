
import React from 'react';

const TechCategory: React.FC<{ title: string; techs: { name: string; icon: string }[] }> = ({ title, techs }) => (
  <div className="bg-white dark:bg-darkCard p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
    <h4 className="font-bold text-gray-400 uppercase text-sm tracking-widest mb-6">{title}</h4>
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-6">
      {techs.map((tech) => (
        <div key={tech.name} className="flex flex-col items-center group cursor-default">
          <div className="w-12 h-12 mb-2 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">
            <img 
              src={tech.icon} 
              alt={tech.name} 
              className="w-10 h-10 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter text-center">
            {tech.name}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const TechStack: React.FC = () => {
  const frontend = [
    { name: 'React', icon: 'https://cdn.simpleicons.org/react/61DAFB' },
    { name: 'TypeScript', icon: 'https://cdn.simpleicons.org/typescript/3178C6' },
    { name: 'Tailwind', icon: 'https://cdn.simpleicons.org/tailwindcss/06B6D4' },
    { name: 'HTML5', icon: 'https://cdn.simpleicons.org/html5/E34F26' },
    { name: 'CSS3', icon: 'https://cdn.simpleicons.org/css/1572B6' },
    { name: 'JavaScript', icon: 'https://cdn.simpleicons.org/javascript/F7DF1E' },
  ];

  const backend = [
    { name: 'Node.js', icon: 'https://cdn.simpleicons.org/nodedotjs/339933' },
    { name: 'Express', icon: 'https://cdn.simpleicons.org/express/000000' },
    { name: 'Spring Boot', icon: 'https://cdn.simpleicons.org/springboot/6DB33F' },
    { name: 'Python', icon: 'https://cdn.simpleicons.org/python/3776AB' },
    { name: 'Go', icon: 'https://cdn.simpleicons.org/go/00ADD8' },
  ];

  const database = [
    { name: 'PostgreSQL', icon: 'https://cdn.simpleicons.org/postgresql/4169E1' },
    { name: 'MongoDB', icon: 'https://cdn.simpleicons.org/mongodb/47A248' },
    { name: 'MySQL', icon: 'https://cdn.simpleicons.org/mysql/4479A1' },
    { name: 'Redis', icon: 'https://cdn.simpleicons.org/redis/DC382D' },
  ];

  const cloud = [
    { name: 'Firebase', icon: 'https://cdn.simpleicons.org/firebase/FFCA28' },
    { name: 'Docker', icon: 'https://cdn.simpleicons.org/docker/2496ED' },
    { name: 'GitHub', icon: 'https://cdn.simpleicons.org/github/181717' },
    { name: 'Razorpay', icon: 'https://cdn.simpleicons.org/razorpay/3395FF' },
    { name: 'Stripe', icon: 'https://cdn.simpleicons.org/stripe/008CDD' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-display font-bold text-deepBlue dark:text-white mb-4">Our Technology Stack</h2>
        <p className="text-gray-600 dark:text-gray-400 text-lg">We use the most modern and reliable technologies to build your future.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <TechCategory title="Frontend" techs={frontend} />
        <TechCategory title="Backend" techs={backend} />
        <TechCategory title="Database" techs={database} />
        <TechCategory title="Cloud & Integration" techs={cloud} />
      </div>
    </div>
  );
};

export default TechStack;
