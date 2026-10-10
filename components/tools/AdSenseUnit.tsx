import React, { useEffect } from 'react';

// Default global AdSense client ID (can be customized via VITE_GOOGLE_ADSENSE_CLIENT or props)
const DEFAULT_CLIENT_ID =
  (typeof import.meta !== 'undefined' && ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_ADSENSE_CLIENT)) ||
  'ca-pub-XXXXXXXXXXXXXXXX';

interface AdSenseUnitProps {
  slotId?: string; // Optional Google AdSense Slot ID (e.g. '1234567890')
  client?: string; // Optional publisher ID, defaults to env or placeholder
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  layoutKey?: string;
  responsive?: boolean;
  placementLabel?: string;
  minHeight?: string;
  className?: string;
}

/**
 * AdSenseUnit Component:
 * - Adheres strictly to Google AdSense Publisher Guidelines.
 * - Prevents Cumulative Layout Shift (CLS) by reserving fixed/minimum dimensions.
 * - Displays a sleek, professional placeholder banner when no live AdSense slot ID is configured.
 * - When real AdSense publisher/slot IDs are provided, safely pushes adsbygoogle.
 */
const AdSenseUnit: React.FC<AdSenseUnitProps> = ({
  slotId,
  client = DEFAULT_CLIENT_ID,
  format = 'auto',
  layoutKey,
  responsive = true,
  placementLabel = 'Advertisement • Google Ads',
  minHeight = 'min-h-[100px] sm:min-h-[120px]',
  className = '',
}) => {
  const isLiveConfigured = Boolean(
    client &&
    slotId &&
    client !== 'ca-pub-XXXXXXXXXXXXXXXX' &&
    slotId !== '1234567890'
  );

  useEffect(() => {
    if (isLiveConfigured && typeof window !== 'undefined') {
      try {
        ((window as unknown as { adsbygoogle: unknown[] }).adsbygoogle =
          (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || []).push({});
      } catch (err) {
        console.warn('Google AdSense render notice:', err);
      }
    }
  }, [isLiveConfigured, slotId]);

  return (
    <div
      className={`w-full max-w-5xl mx-auto my-6 px-4 flex flex-col items-center justify-center ${className}`}
      aria-label="Advertisement Banner"
    >
      <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-500 mb-1.5 self-center select-none flex items-center gap-1.5">
        <span>Advertisement</span>
        <span className="text-[9px] text-gray-400 font-normal">• Google Ads</span>
      </div>

      <div
        className={`w-full ${minHeight} rounded-2xl border border-dashed border-gray-300 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-900/40 flex flex-col items-center justify-center text-center p-4 transition-all overflow-hidden`}
      >
        {isLiveConfigured ? (
          <ins
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: '100%' }}
            data-ad-client={client}
            data-ad-slot={slotId}
            data-ad-format={format}
            data-ad-layout-key={layoutKey}
            data-full-width-responsive={responsive ? 'true' : 'false'}
          />
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 text-xs text-gray-500 dark:text-gray-400 py-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-royalBlue dark:bg-royalBlue/20 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
              Google Ads Slot: {placementLabel}
            </span>
            <span className="text-gray-400 dark:text-gray-500 text-[11px]">
              Ready for Google AdSense • Paste your <code className="font-mono text-gray-600 dark:text-gray-300">data-ad-slot</code> or publisher ID in .env
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdSenseUnit;
