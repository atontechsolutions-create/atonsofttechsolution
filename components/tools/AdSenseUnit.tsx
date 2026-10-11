import React, { useEffect, useState } from 'react';

// Default global AdSense client ID (can be customized via VITE_GOOGLE_ADSENSE_CLIENT or props)
const DEFAULT_CLIENT_ID =
  (typeof import.meta !== 'undefined' && ((import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_ADSENSE_CLIENT)) ||
  'ca-pub-6257342305698628';

interface AdSenseUnitProps {
  slotId?: string; // Optional Google AdSense Slot ID
  client?: string; // Optional publisher ID
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  layoutKey?: string;
  responsive?: boolean;
  placementLabel?: string;
  minHeight?: string;
  className?: string;
}

/**
 * AdSenseUnit Component:
 * - With Google Auto Ads active site-wide via <head>, manual placeholder banners are suppressed.
 * - This prevents layout clutter, empty boxes, and banner fatigue while Google Auto Ads automatically
 *   discovers high-yield placements.
 * - If an explicit production slotId is configured and live ads are enabled, it renders the slot smoothly.
 */
const AdSenseUnit: React.FC<AdSenseUnitProps> = ({
  slotId,
  client = DEFAULT_CLIENT_ID,
  format = 'auto',
  layoutKey,
  responsive = true,
  className = '',
}) => {
  // Detect developer environment (localhost, dev previews, or explicit developer toggle)
  const isDevHost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('run.app') ||
      window.location.hostname.includes('.local'));

  const [isDeveloperBypass, setIsDeveloperBypass] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const urlParam = new URLSearchParams(window.location.search).get('dev_ads');
    if (urlParam === 'off' || urlParam === 'false' || urlParam === '0') return true;
    if (urlParam === 'on' || urlParam === 'true' || urlParam === '1') return false;
    return localStorage.getItem('adsense_developer_block') === 'true';
  });

  const [isTestAdMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const urlParam = new URLSearchParams(window.location.search).get('test_ads');
    if (urlParam === 'on') return true;
    return localStorage.getItem('adsense_test_mode') === 'true';
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = () => {
      const blocked = localStorage.getItem('adsense_developer_block') === 'true';
      setIsDeveloperBypass(blocked);
    };

    window.addEventListener('adsense-dev-mode-change', handleStorageChange);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('adsense-dev-mode-change', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const isLiveConfigured = Boolean(
    client &&
    slotId &&
    client !== 'ca-pub-XXXXXXXXXXXXXXXX' &&
    slotId !== '1234567890' &&
    !isDevHost &&
    !isDeveloperBypass
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

  // If no explicit live slot is configured, return null so Google Auto Ads controls placement cleanly
  if (!isLiveConfigured) {
    return null;
  }

  return (
    <div
      className={`w-full max-w-5xl mx-auto my-6 px-4 flex flex-col items-center justify-center ${className}`}
      aria-label="Advertisement Banner"
    >
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-ad-client={client}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-ad-layout-key={layoutKey}
        data-full-width-responsive={responsive ? 'true' : 'false'}
        data-adtest={isTestAdMode ? 'on' : undefined}
      />
    </div>
  );
};

export default AdSenseUnit;
