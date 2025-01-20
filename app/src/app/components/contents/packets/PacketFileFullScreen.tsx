import { useParams } from "react-router-dom";
import { PacketReport } from "./PacketReport";
import { ImageDisplay } from "../downloads/ImageDisplay";
import { isHtmlFile, isImageFile } from "../downloads/utils/extensions";
import { getFileByPath } from "../downloads/utils/getFileByPath";
import { usePacketOutletContext } from "../../main/PacketOutlet";

export const PacketFileFullScreen = () => {
  // The * (or 'splat') parameter lets us handle file paths that contain slashes.
  const { "*": filePath } = useParams();
  const { packet } = usePacketOutletContext();

  if (!packet || !filePath) return null;

  const file = getFileByPath(filePath, packet);

  return file ? (
    <div className="h-screen">
      {isImageFile(file) && <ImageDisplay packet={packet} fileHash={file.hash} />}
      {isHtmlFile(file) && <PacketReport packet={packet} fileHash={file.hash} />}
    </div>
  ) : null;
};
