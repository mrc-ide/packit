import { Button } from "../../../Base/Button";
import { FolderDown } from "lucide-react";

export const FileGroupDownloadButton = () => {
  return (
    <Button variant="outline" className="py-0.5 bg-gray-100 hover:bg-gray-50 h-fit">
      <FolderDown size={26} className="pe-2" /> Download as .zip
    </Button>
  );
};
