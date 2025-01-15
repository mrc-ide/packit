import { Button } from "../../../Base/Button";
import { FolderDown } from "lucide-react";

export const DownloadAllFilesButton = () => {
  return (
    <Button variant="default" className="py-1 h-fit">
      <FolderDown size={26} className="pe-2" /> Download all as .zip
    </Button>
  );
};
