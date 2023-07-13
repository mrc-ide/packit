export function bytesToSize(bytes: number): string {
    const units = ["byte", "kilobyte", "megabyte", "gigabyte", "terabyte"];

    const navigatorLocal = navigator.languages && navigator.languages.length >= 0 ? navigator.languages[0] : "en-GB";
    const unitIndex = Math.max(0, Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1));

    return Intl.NumberFormat(navigatorLocal, {
        style: "unit",
        unit: units[unitIndex]
    }).format(bytes / (1024 ** unitIndex));
}
