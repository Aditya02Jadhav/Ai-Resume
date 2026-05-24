import React, { useEffect } from 'react';

export default function AdBanner({ dataAdSlot, format = 'auto', className = '' }) {
  useEffect(() => {
    // Only attempt to push the ad if window.adsbygoogle is available and not already pushed for this block
    try {
      if (window && window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch (e) {
      console.error("Adsense Error:", e.message);
    }
  }, []);

  return (
    <div className={`w-full overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/30 rounded-xl p-2 text-slate-400 dark:text-slate-500 text-sm font-medium ${className}`}>
        {/* Placeholder for development or AdBlock users */}
        <div className="absolute opacity-50 flex items-center gap-2 pointer-events-none">
            <span className="text-xs uppercase tracking-widest border border-current px-1 rounded">Ad</span>
            <span className="hidden sm:inline">Advertisement Space</span>
        </div>
        
        {/* The actual Google AdSense Ins element */}
        <ins className="adsbygoogle relative z-10 block w-full text-center"
             style={{ display: "block" }}
             data-ad-client="ca-pub-YOUR_ADSENSE_ID"
             data-ad-slot={dataAdSlot || "YOUR_AD_SLOT_ID"}
             data-ad-format={format}
             data-full-width-responsive="true">
        </ins>
    </div>
  );
}
