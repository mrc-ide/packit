import { ChartColumn, File, FileCode2, Presentation, TableProperties } from "lucide-react";
import {
  presentationExtensions,
  tableExtensions,
  imageExtensions,
  scriptExtensions,
  filePathToExtension
} from "./utils/extensions";

interface FileIconProps {
  path: string;
}

const defaultFileIcon = <File className="text-gray-400" />;

export const ExtensionIcon = ({ path }: FileIconProps) => {
  const extension = filePathToExtension(path);

  if (!extension) return defaultFileIcon;

  if (presentationExtensions.includes(extension)) return <Presentation />;
  if (tableExtensions.includes(extension)) return <TableProperties />;
  if (imageExtensions.includes(extension)) return <ChartColumn />;
  if (scriptExtensions.includes(extension)) return <FileCode2 />;

  return defaultFileIcon;
};
