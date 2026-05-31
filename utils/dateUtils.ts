// dateUtils
import { useEffect, useState } from "react";

// Takes a date in the past and returns a string defining how long time since
export const formatRelativeTime = (isoString: string): string => {
  const now = new Date();
  const then = new Date(isoString);
  const diffMs = now.getTime() - then.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return "lige nu";
  if (diffMin < 60) return `${diffMin} min siden`;
  if (diffHours < 24) return `${diffHours} t. siden`;
  if (diffDays < 7) return `${diffDays} d. siden`;

  // If it is more than a week - return the date
  return then.toLocaleDateString("da-DK", {
    day: "numeric",
    month: "short",
  });
};

// Takes a date in the future and returns a string defining how long time left
export const getTimeRemaining = (expiresAt: string): string => {
  const now = new Date().getTime();
  const expires = new Date(expiresAt).getTime();
  const timeLeft = expires - now;

  if (timeLeft <= 0) {
    return "Udløbet";
  }

  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

// Custom hook that forces React to render every second
export const useCountdown = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);
};

export const isExpired = (expiresAt: string): boolean => {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() <= Date.now();
};
