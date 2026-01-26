// frontend/src/components/OfflineIndicator.tsx
// Component to indicate online/offline status of the app
// Listens to online and offline events to update status
// Displays a notification banner when going offline or coming back online
// Styled with Tailwind CSS for a modern look.





import { Wifi, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      
      // Auto-hide success notification after 3 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't show anything if online and notification is hidden
  if (isOnline && !showNotification) {
    return null;
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-red-500 text-white'
      } ${showNotification ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      {isOnline ? (
        <>
          <Wifi className="w-5 h-5" />
          <span className="font-medium">Back Online</span>
        </>
      ) : (
        <>
          <WifiOff className="w-5 h-5 animate-pulse" />
          <div>
            <div className="font-medium">You're Offline</div>
            <div className="text-xs opacity-90">Some features may be limited</div>
          </div>
        </>
      )}
    </div>
  );
}
