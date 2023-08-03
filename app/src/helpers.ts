export function bytesToSize(bytes: number): string {
    const units = ["bytes", "kilobytes", "megabytes", "gigabytes", "terabytes"];

    const unitIndex = Math.max(0, Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1));

    const size = (bytes / (1024 ** unitIndex)).toFixed(2);

    return `${parseFloat(size)} ${units[unitIndex]}`;
}
