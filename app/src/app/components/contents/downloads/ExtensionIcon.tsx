import { ChartColumn, File, FileCode2, Presentation, TableProperties } from "lucide-react";

interface FileIconProps {
  path: string;
}

const presentationExtensions = ["pdf", "html", "ppt", "pptm", "pptx", "potx", "potm", "pps", "xps"];
const tableExtensions = ["csv", "xls", "xlsx", "xlsm", "xltx", "ods"];
const imageExtensions = ["jpeg", "jpg", "png", "jiff", "bmp", "gif"];
const scriptExtensions = ["r", "rmd", "py", "ipynb", "sql", "sh", "bat", "ps1", "cmd"];
const defaultFileIcon = <File className="text-gray-400" />;

export const ExtensionIcon = ({ path }: FileIconProps) => {
  const extension = path.split(".").pop()?.toLowerCase();

  if (!extension) return defaultFileIcon;

  if (presentationExtensions.includes(extension)) return <Presentation />;
  if (tableExtensions.includes(extension)) return <TableProperties />;
  if (imageExtensions.includes(extension)) return <ChartColumn />;
  if (scriptExtensions.includes(extension)) return <FileCode2 />;

  return defaultFileIcon;
};