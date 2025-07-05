'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    PushEngage: any[];
    _peq: any[];
  }
}

const PushEngageScript = () => {
  useEffect(() => {
    // Initialize PushEngage
    window.PushEngage = window.PushEngage || [];
    window._peq = window._peq || [];
    
    // Configure PushEngage
    window.PushEngage.push(['init', {
      appId: 'cf02cb04-3bc3-40bc-aef1-dc98cb81379d'
    }]);

    // Load the PushEngage script
    const script = document.createElement('script');
    script.src = 'https://clientcdn.pushengage.com/sdks/pushengage-web-sdk.js';
    script.async = true;
    script.type = 'text/javascript';
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const existingScript = document.querySelector('script[src="https://clientcdn.pushengage.com/sdks/pushengage-web-sdk.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default PushEngageScript; 