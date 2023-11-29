export const getTimeDifferenceToDisplay = (unixTime: number): { unit: string; value: number } => {
  const currentTime = Math.floor(Date.now() / 1000); // Get current Unix timestamp
  const difference = currentTime - unixTime; // Calculate difference in seconds

  const days = Math.floor(difference / (24 * 60 * 60));
  if (days > 0) return { unit: "days", value: days };

  const hours = Math.floor(difference / (60 * 60));
  if (hours > 0) return { unit: "hours", value: hours };

  const minutes = Math.floor(difference / 60);
  if (minutes > 0) return { unit: "minutes", value: minutes };

  return { unit: "seconds", value: difference };
};
