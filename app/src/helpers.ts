import { FileMetadata, TimeMetadata } from "./types";

export const bytesToSize = (bytes: number): string => {
  const units = ["bytes", "KB", "MB", "GB", "TB"];

  const unitIndex = Math.max(0, Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1));

  const size = (bytes / 1024 ** unitIndex).toFixed(2);

  return `${parseFloat(size)} ${units[unitIndex]}`;
};

export const filesToSize = (files: FileMetadata[]): string => {
  return bytesToSize(files.reduce((acc, file) => acc + file.size, 0));
};

export const getDateUTCString = (time: TimeMetadata) => {
  return new Date(time.start * 1000).toUTCString();
};

export const getElapsedTime = (time: TimeMetadata) => {
  // Multiply by 1000 to convert seconds to milliseconds
  const startDateInMillis = time.start * 1000;
  const endDateInMillis = time.end * 1000;

  const timeDiffInMillis = Math.floor(new Date(endDateInMillis).getTime() - new Date(startDateInMillis).getTime());

  const milliseconds = timeDiffInMillis % 1000;
  const minutes = Math.floor(timeDiffInMillis / 60000);
  const seconds = Math.floor((timeDiffInMillis % 60000) / 1000);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  let formattedTime = "";
  if (hours > 0) {
    formattedTime += `${hours} hour${hours > 1 ? "s" : ""}`;
  }
  if (remainingMinutes > 0) {
    formattedTime += ` ${remainingMinutes} minute${remainingMinutes > 1 ? "s" : ""}`;
  }
  if (seconds > 0) {
    formattedTime += ` ${seconds} second${seconds > 1 ? "s" : ""}`;
  }
  if (milliseconds >= 0) {
    formattedTime += ` ${milliseconds} millisecond${milliseconds > 1 ? "s" : ""}`;
  }

  return formattedTime.trim();
};
