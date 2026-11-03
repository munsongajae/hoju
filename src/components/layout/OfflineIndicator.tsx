"use client";

import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Initial check
    setIsOffline(!navigator.onLine);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-orange-500 text-white px-4 py-2 text-sm flex items-center justify-center gap-2 shadow-md animate-in slide-in-from-top z-50 sticky top-0">
      <WifiOff className="w-4 h-4" />
      <span>오프라인 상태입니다. 네트워크 연결을 확인해주세요.</span>
    </div>
  );
}
