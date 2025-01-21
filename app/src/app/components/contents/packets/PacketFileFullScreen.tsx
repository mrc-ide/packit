import { useParams } from "react-router-dom";
import { PacketReport } from "./PacketReport";
import { ImageDisplay } from "../downloads/ImageDisplay";
import { filePathToExtension, isImageFile } from "../downloads/utils/extensions";
import { getFileByPath } from "../downloads/utils/getFileByPath";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { ErrorComponent } from "../common/ErrorComponent";

export const PacketFileFullScreen = () => {
  // The * (or 'splat') parameter lets us handle file paths that contain slashes.
  const { "*": filePath } = useParams();
  const { packet } = usePacketOutletContext();

  if (!packet || !filePath) return null;

  const file = getFileByPath(filePath, packet);
  const isImage = file && isImageFile(file);
  const isHtml = file && filePathToExtension(file.path) === "html";

  return file ? (
    <div className="h-screen">
      {isImage && <ImageDisplay file={file} />}
      {isHtml && <PacketReport packet={packet} fileHash={file.hash} />}
      {!isImage && !isHtml && <p>File type not supported</p>}
    </div>
  ) : (
    <ErrorComponent message={"File not found"} error={new Error("File not found")} />
  );
};
