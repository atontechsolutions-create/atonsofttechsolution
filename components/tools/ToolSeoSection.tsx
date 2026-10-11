import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck, Zap, Sparkles, HelpCircle } from 'lucide-react';
import { SEO_METADATA_MAP } from './seoMetadata';

interface ToolSeoSectionProps {
  currentPath: string;
}

export const ToolSeoSection: React.FC<ToolSeoSectionProps> = ({ currentPath }) => {
  const normalized = currentPath === '/' ? '/' : currentPath.toLowerCase().replace(/\/$/, '');
  const seo = SEO_METADATA_MAP[normalized];
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!seo || normalized === '/') {
    return null;
  }

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <section className="mt-16 pt-10 border-t border-slate-200 dark:border-slate-800 text-left">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-royalBlue/10 text-royalBlue dark:text-sky-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" /> High-Traffic Free Utility
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            {seo.h2Heading}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {seo.description}
          </p>
        </div>

        {/* How It Works Grid */}
        <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" /> How It Works — Step-by-Step
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {seo.howToSteps.map((s) => (
              <div
                key={s.step}
                className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200/80 dark:border-slate-700/80 shadow-xs relative"
              >
                <div className="w-8 h-8 rounded-lg bg-royalBlue text-white font-bold text-sm flex items-center justify-center mb-3">
                  {s.step}
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm mb-1.5">
                  {s.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Key Features & Specifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-royalBlue dark:text-sky-400" /> Core Specifications
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
              {seo.keyFeatures.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Privacy Guarantee */}
          <div className="bg-emerald-500/5 dark:bg-emerald-500/10 p-6 rounded-2xl border border-emerald-500/20">
            <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-300 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> 100% Client-Side Privacy
            </h3>
            <p className="text-xs text-emerald-800 dark:text-emerald-300/90 leading-relaxed mb-3">
              All computations, image cropping, compression, audio synthesis, and document conversions happen directly inside your browser's local sandbox memory.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px] font-medium text-emerald-700 dark:text-emerald-400">
              <span className="bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md">Zero Server Uploads</span>
              <span className="bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md">No Watermarks</span>
              <span className="bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md">No Login Required</span>
            </div>
          </div>
        </div>

        {/* Frequently Asked Questions (FAQ) Section */}
        {seo.faqs && seo.faqs.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-royalBlue dark:text-sky-400" /> Frequently Asked Questions (FAQ)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Answers to popular questions regarding specifications, format requirements, and guidelines.
            </p>

            <div className="space-y-3">
              {seo.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default ToolSeoSection;
