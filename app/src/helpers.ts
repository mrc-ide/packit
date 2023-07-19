import {TimeMetadata} from "./types";

export function bytesToSize(bytes: number): string {
    const units = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"];

    const navigatorLocal = navigator.languages && navigator.languages.length >= 0 ? navigator.languages[0] : "en-GB";
    const unitIndex = Math.max(0, Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1));

    return Intl.NumberFormat(navigatorLocal, {
        style: "unit",
        unit: units[unitIndex]
    }).format(bytes / (1024 ** unitIndex));
}

export const getDateUTCString = (time: TimeMetadata) => {
    return new Date(time.start * 1000).toUTCString();
};

export const getElapsedTime = (time: TimeMetadata) => {
    // Multiply by 1000 to convert seconds to milliseconds
    const startDateInMillis = time.start * 1000;
    const endDateInMillis = time.end * 1000;

    const timeDiffInMillis = Math.floor(new Date(endDateInMillis).getTime() - new Date(startDateInMillis).getTime());
    // Convert milliseconds to minutes
    const minutes = Math.floor(timeDiffInMillis / 60000);
    // Convert the remaining milliseconds to seconds
    const seconds = Math.floor((timeDiffInMillis % 60000) / 1000);
    // Convert minutes to hours
    const hours = Math.floor(minutes / 60);
    // Calculate remaining minutes after subtracting hours
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

    return formattedTime;
};

