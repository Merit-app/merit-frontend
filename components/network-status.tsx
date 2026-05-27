'use client';

import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);
      // Hide the "back online" message after 3 seconds
      setTimeout(() => setWasOffline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setWasOffline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !wasOffline) return null;

  return (
    <div
      className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        isOnline && wasOffline
          ? 'bg-success/10 border-b border-success/30 text-success'
          : 'bg-warning/10 border-b border-warning/30 text-warning'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-2.5 text-[13px] font-medium">
        {isOnline && wasOffline ? (
          <>
            <Wifi size={16} />
            Back online
          </>
        ) : (
          <>
            <WifiOff size={16} />
            No internet connection — changes may not save
          </>
        )}
      </div>
    </div>
  );
}
