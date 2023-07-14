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
    return new Date(time.start).toUTCString();
};

export const getElapsedTime = (time: TimeMetadata) => {
    const timeDiffInMillis = Math.floor(new Date(time.end).getTime() - new Date(time.start).getTime());
    const minutes = Math.floor(timeDiffInMillis / 60000); // Convert milliseconds to minutes
    const seconds = Math.floor((timeDiffInMillis % 60000) / 1000); // Convert the remaining milliseconds to seconds

    let formattedTime = "";
    if (minutes > 0) {
        formattedTime += `${minutes} minute${minutes > 1 ? "s" : ""}`;
    }
    if (seconds > 0) {
        formattedTime += ` ${seconds} second${seconds > 1 ? "s" : ""}`;
    }

    return formattedTime;
};

