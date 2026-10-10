import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Image as ImageIcon,
  PenTool,
  Minimize2,
  RefreshCw,
  FileText,
  Music,
  CheckCircle2,
  Search,
  Sliders,
  Scissors,
  Layers,
  Camera,
  QrCode,
  Crop,
  Lock,
  Mic,
  Video,
  Volume2,
  Keyboard,
  Monitor,
  Tv,
  Wifi,
  Globe,
  Server,
  Cpu,
  Type,
  Shield,
  FileCheck,
} from 'lucide-react';
import AdSenseUnit from './AdSenseUnit';
import { ALL_TOOLS_CATALOG, TOOL_CATEGORIES, ToolCategory, ToolItem } from './toolsData';

interface ToolsIndexProps {
  onNavigateToTool: (toolPath: string) => void;
  onNavigateHome: (sectionId?: string) => void;
}

const renderIcon = (iconName: string, className = 'w-6 h-6 text-vibrantOrange') => {
  switch (iconName) {
    case 'PenTool':
      return <PenTool className={className} />;
    case 'Image':
      return <ImageIcon className={className} />;
    case 'Camera':
      return <Camera className={className} />;
    case 'Minimize2':
      return <Minimize2 className={className} />;
    case 'RefreshCw':
      return <RefreshCw className={className} />;
    case 'FileText':
      return <FileText className={className} />;
    case 'FileCheck':
      return <FileCheck className={className} />;
    case 'Music':
      return <Music className={className} />;
    case 'Sliders':
      return <Sliders className={className} />;
    case 'Scissors':
      return <Scissors className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    case 'QrCode':
      return <QrCode className={className} />;
    case 'Crop':
      return <Crop className={className} />;
    case 'Lock':
      return <Lock className={className} />;
    case 'Mic':
      return <Mic className={className} />;
    case 'Video':
      return <Video className={className} />;
    case 'Volume2':
      return <Volume2 className={className} />;
    case 'Keyboard':
      return <Keyboard className={className} />;
    case 'Monitor':
      return <Monitor className={className} />;
    case 'Tv':
      return <Tv className={className} />;
    case 'Wifi':
      return <Wifi className={className} />;
    case 'Globe':
      return <Globe className={className} />;
    case 'Server':
      return <Server className={className} />;
    case 'Cpu':
      return <Cpu className={className} />;
    case 'Type':
      return <Type className={className} />;
    case 'Shield':
      return <Shield className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};

const getCategoryBadgeColor = (category: ToolCategory) => {
  switch (category) {
    case 'Photo & Signature Tools':
      return 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
    case 'Image Tools':
      return 'text-royalBlue bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    case 'PDF Tools':
      return 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800';
    case 'Device Testers':
      return 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800';
    case 'Internet & Network Tools':
      return 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800';
    case 'Text & Daily Utilities':
      return 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200 dark:border-purple-800';
    default:
      return 'text-gray-600 bg-gray-50 dark:bg-slate-800 dark:text-gray-400 border-gray-200 dark:border-slate-700';
  }
};

const ToolsIndex: React.FC<ToolsIndexProps> = ({ onNavigateToTool, onNavigateHome }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filterTabs = ['All', ...TOOL_CATEGORIES];

  const filteredTools = ALL_TOOLS_CATALOG.filter((tool) => {
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const availableToolsCount = ALL_TOOLS_CATALOG.filter((t) => t.isAvailable).length;

  return (
    <div className="w-full">
      {/* Breadcrumb Navigation */}
      <div className="bg-gray-50 dark:bg-slate-900/60 border-b border-gray-200 dark:border-slate-800 py-3.5 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            <button
              onClick={() => onNavigateHome('home')}
              className="hover:text-vibrantOrange font-medium transition-colors"
            >
              Home
            </button>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-semibold">
              Free Online Tools Directory
            </span>
          </nav>
        </div>
      </div>

      {/* Header Banner */}
      <section className="pt-12 pb-10 sm:pt-16 sm:pb-14 text-center bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-slate-900 dark:via-darkBg dark:to-slate-900/50 border-b border-gray-100 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-royalBlue/20 text-royalBlue dark:text-blue-300 text-xs sm:text-sm font-bold mb-5 border border-blue-100 dark:border-blue-800 shadow-sm">
            <Sparkles size={16} className="text-vibrantOrange animate-pulse" />
            <span>Complete Suite of 40+ Online Utilities • 100% Client-Side Privacy</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-gray-900 dark:text-white mb-4">
            ATON TECH Online Tools Suite
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Organized section-wise: from government exam photo & signature resizers to image compressors, PDF utilities, device hardware testers, network diagnostics, and daily text converters.
          </p>

          {/* Quick Stats Pill */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={15} /> {availableToolsCount} Live Active Tools
            </span>
            <span>•</span>
            <span>Zero server upload (100% browser execution)</span>
            <span>•</span>
            <span>Vercel Hosted & Mobile Responsive</span>
          </div>

          {/* Search bar & Category Filter */}
          <div className="mt-8 max-w-2xl mx-auto space-y-4">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tools (e.g., signature 140x60, 20kb, webcam test, pdf, case converter)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-vibrantOrange transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              {filterTabs.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                    selectedCategory === cat
                      ? 'bg-vibrantOrange text-white shadow-md scale-105'
                      : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700/80 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Google Ads Top Placement */}
      <AdSenseUnit placementLabel="Tools Index Top Leaderboard" />

      {/* Section-by-Section Tools Listing */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {TOOL_CATEGORIES.map((categoryName) => {
          if (selectedCategory !== 'All' && selectedCategory !== categoryName) return null;
          const toolsInCategory = filteredTools.filter((t) => t.category === categoryName);
          if (toolsInCategory.length === 0) return null;

          return (
            <div key={categoryName} id={categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-')} className="mb-16 last:mb-0">
              {/* Category Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-xl text-xs font-bold border ${getCategoryBadgeColor(categoryName)}`}>
                    {categoryName}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white font-display">
                    {categoryName}
                  </h2>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {toolsInCategory.length} {toolsInCategory.length === 1 ? 'utility' : 'utilities'}
                </span>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {toolsInCategory.map((tool: ToolItem) => (
                  <div
                    key={tool.id}
                    onClick={() => {
                      if (tool.isAvailable && tool.path) {
                        onNavigateToTool(tool.path);
                      }
                    }}
                    className={`rounded-3xl p-6 sm:p-7 bg-white dark:bg-slate-900 border transition-all flex flex-col justify-between relative ${
                      tool.isAvailable && tool.path
                        ? 'cursor-pointer hover:-translate-y-1 border-gray-200 dark:border-slate-800 hover:border-vibrantOrange shadow-sm hover:shadow-xl group'
                        : 'opacity-75 border-dashed border-gray-300 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/40'
                    }`}
                  >
                    {tool.badge && (
                      <div
                        className={`absolute top-4 right-4 text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-1 rounded-full shadow-sm ${
                          tool.badgeColor || 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {tool.badge}
                      </div>
                    )}

                    <div>
                      <div className="w-13 h-13 w-12 h-12 rounded-2xl bg-gray-50 dark:bg-slate-800/80 flex items-center justify-center mb-5 border border-gray-100 dark:border-slate-800">
                        {renderIcon(tool.iconName, 'w-6 h-6 text-vibrantOrange')}
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-vibrantOrange transition-colors">
                        {tool.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-5 leading-relaxed">
                        {tool.description}
                      </p>

                      <div className="space-y-1.5 mb-6 text-xs text-gray-500 dark:text-gray-400">
                        {tool.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      {tool.isAvailable && tool.path ? (
                        <button className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gray-50 dark:bg-slate-800 group-hover:bg-vibrantOrange text-gray-900 dark:text-white group-hover:text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm">
                          <span>Launch Tool</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      ) : (
                        <div className="w-full text-center py-2.5 rounded-2xl bg-gray-100 dark:bg-slate-800/50 text-gray-400 dark:text-gray-500 text-xs font-semibold">
                          In Development • Rollout Soon
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Google Ads Bottom In-Feed Unit */}
      <AdSenseUnit placementLabel="Tools Index Footer Banner" />

      {/* Suggestion Section */}
      <section className="bg-gradient-to-r from-deepBlue to-royalBlue py-12 px-4 sm:px-6 lg:px-8 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl font-black font-display mb-3">
            Need a Custom Tool or Enterprise Business Software?
          </h3>
          <p className="text-sm sm:text-base text-blue-100 mb-6">
            ATON TECH Solutions builds bespoke web applications, automated document processing engines, and cloud software.
          </p>
          <button
            onClick={() => onNavigateHome('contact-us')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-vibrantOrange hover:bg-orange-600 text-white font-bold text-sm shadow-lg hover:shadow-orange-500/30 transition-all"
          >
            <span>Request Custom Solution</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default ToolsIndex;
