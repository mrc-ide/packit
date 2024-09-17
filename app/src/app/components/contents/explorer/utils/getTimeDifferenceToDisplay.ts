export const getTimeDifferenceToDisplay = (
  startTime: number,
  endTime = Math.floor(Date.now() / 1000) // default to current unix timestamp
): { unit: string; value: number }[] => {
  const difference = endTime - startTime; // Calculate difference in seconds

  const days = Math.floor(difference / (24 * 60 * 60));
  const hours = Math.floor((difference % (24 * 60 * 60)) / (60 * 60));
  const minutes = Math.floor((difference % (60 * 60)) / 60);
  const seconds = Math.round(difference % 60);

  return [
    { unit: "days", value: days },
    { unit: "hours", value: hours },
    { unit: "minutes", value: minutes },
    { unit: "seconds", value: seconds }
  ].filter((unit) => unit.value > 0);
};
