import { FileMetadata, PacketMetadata } from "../../../../types";
import { ImageDisplay } from "../downloads/ImageDisplay";
import { filePathToExtension, isImageFile } from "../downloads/utils/extensions";
import { PacketReport } from "./PacketReport";

interface PacketFileContent {
  file: FileMetadata;
  packet: PacketMetadata;
}
export const PacketFileFullScreenContent = ({ file, packet }: PacketFileContent) => {
  const isImage = isImageFile(file);
  const isHtml = filePathToExtension(file.path) === "html";

  if (isImage) {
    return <ImageDisplay file={file} packet={packet} />;
  }
  if (isHtml) {
    return <PacketReport packet={packet} fileHash={file.hash} />;
  }
  return <p>File type not supported</p>;
};
