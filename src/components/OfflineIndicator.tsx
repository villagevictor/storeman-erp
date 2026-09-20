import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <aside
      id="pwa-offline-indicator"
      aria-label="Offline status"
      className="fixed bottom-16 sm:bottom-4 left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 text-white px-3.5 py-2 text-xs font-medium shadow-lg animate-pulse"
    >
      <WifiOff className="w-4 h-4" />
      <span>Offline Mode — Operating from local cache</span>
    </aside>
  );
};
