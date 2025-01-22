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

  const content = () => {
    if (isImage) {
      return <ImageDisplay file={file} />;
    } else if (isHtml) {
      return <PacketReport packet={packet} fileHash={file.hash} />;
    } else {
      return <p>File type not supported</p>;
    }
  };

  return file ? (
    <div className="h-screen">{content()}</div>
  ) : (
    <ErrorComponent message={"File not found"} error={new Error("File not found")} />
  );
};
