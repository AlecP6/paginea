'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdSenseProps {
  slot?: string;
  style?: React.CSSProperties;
  format?: string;
  responsive?: boolean;
  className?: string;
}

export default function AdSense({
  slot,
  style = { display: 'block' },
  format = 'auto',
  responsive = true,
  className = '',
}: AdSenseProps) {
  useEffect(() => {
    try {
      if (window.adsbygoogle && window.adsbygoogle.loaded) {
        return;
      }
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-9705213079025649"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}

