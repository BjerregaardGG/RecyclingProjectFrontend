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
