import React from 'react';
import { ArrowRight, Image as ImageIcon, PenTool, Minimize2, RefreshCw } from 'lucide-react';

interface ToolSuggestion {
  id: string;
  name: string;
  description: string;
  path: string;
  category: 'Image Tools' | 'PDF Tools' | 'Audio Tools';
  icon: React.ReactNode;
  badge?: string;
}

interface SuggestedToolsProps {
  currentToolId: string;
  currentCategory?: string;
  onNavigateToTool?: (path: string) => void;
  onNavigate?: (path: string) => void;
}

export const ALL_TOOLS: ToolSuggestion[] = [
  {
    id: 'signature-resizer',
    name: 'Signature Resizer',
    description: 'Resize and crop official signatures to 140×60 px, clean white background, and compress under 20 KB.',
    path: '/tools/signature-resizer',
    category: 'Image Tools',
    icon: <PenTool size={20} className="text-emerald-500" />,
    badge: 'Popular',
  },
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Compress any JPG, PNG, or WebP to an exact target file size: 10 KB, 20 KB, 50 KB, or 100 KB.',
    path: '/tools/image-compressor',
    category: 'Image Tools',
    icon: <Minimize2 size={20} className="text-blue-500" />,
    badge: 'Fast',
  },
  {
    id: 'image-converter',
    name: 'Image Converter',
    description: 'Instantly convert images between JPG, PNG, and WebP formats right in your browser with zero quality loss.',
    path: '/tools/image-converter',
    category: 'Image Tools',
    icon: <RefreshCw size={20} className="text-purple-500" />,
    badge: 'Instant',
  },
  {
    id: 'photo-signature-resizer',
    name: 'Photo & Signature Resizer',
    description: 'All-in-one photo and signature resizer for exam forms, visas, and government applications.',
    path: '/tools/photo-signature-resizer',
    category: 'Image Tools',
    icon: <ImageIcon size={20} className="text-vibrantOrange" />,
    badge: 'All-in-One',
  },
];

const SuggestedTools: React.FC<SuggestedToolsProps> = ({
  currentToolId,
  onNavigateToTool,
  onNavigate,
}) => {
  const suggestions = ALL_TOOLS.filter((tool) => tool.id !== currentToolId);

  const handleNav = (path: string) => {
    const navFn = onNavigateToTool || onNavigate;
    if (navFn) {
      navFn(path);
    } else if (typeof window !== 'undefined') {
      window.location.pathname = path;
    }
  };

  return (
    <div className="w-full mt-14 pt-10 border-t border-gray-200 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
            Need Other Tools?
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Explore our specialized single-purpose utilities for images, forms, and applications.
          </p>
        </div>
        <button
          onClick={() => handleNav('/tools')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-royalBlue hover:text-vibrantOrange transition-colors"
        >
          <span>View all tools</span>
          <ArrowRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {suggestions.map((tool) => (
          <div
            key={tool.id}
            onClick={() => handleNav(tool.path)}
            className="group cursor-pointer p-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 hover:border-vibrantOrange/50 dark:hover:border-vibrantOrange/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                  {tool.icon}
                </div>
                {tool.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 dark:bg-vibrantOrange/10 text-vibrantOrange border border-orange-200/60 dark:border-orange-500/20">
                    {tool.badge}
                  </span>
                )}
              </div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-vibrantOrange transition-colors mb-1">
                {tool.name}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                {tool.description}
              </p>
            </div>
            <div className="inline-flex items-center gap-1 text-xs font-semibold text-royalBlue dark:text-blue-400 group-hover:text-vibrantOrange transition-colors pt-2 border-t border-gray-100 dark:border-slate-800/60">
              <span>Open Tool</span>
              <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedTools;
