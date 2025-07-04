import { FileMetadata } from "@/types";

export const presentationExtensions = ["pdf", "html", "ppt", "pptm", "pptx", "potx", "potm", "pps", "xps"];
export const tableExtensions = ["csv", "xls", "xlsx", "xlsm", "xltx", "ods"];
export const imageExtensions = ["jpeg", "jpg", "png", "jiff", "bmp", "gif", "webp"];
export const scriptExtensions = ["r", "rmd", "py", "ipynb", "sql", "sh", "bat", "ps1", "cmd"];

export const filePathToExtension = (path: string) => path.split(".").pop()?.toLowerCase() || "";

export const isImageFile = (file: FileMetadata) => {
  return imageExtensions.includes(filePathToExtension(file.path));
};
