import { FileMetadata, PacketMetadata } from "../../../../types";
import { useFileObjectUrl } from "./hooks/useFileObjectUrl";
import { ErrorComponent } from "../common/ErrorComponent";

const defaultErrorMessage = "Error loading image file";

interface ImageDisplayProps {
  file: FileMetadata;
  packet: PacketMetadata;
}

export const ImageDisplay = ({ file, packet }: ImageDisplayProps) => {
  const { fileObjectUrl, error } = useFileObjectUrl(file, packet);

  if (error) return <ErrorComponent message={defaultErrorMessage} error={error} />;

  return <img src={fileObjectUrl} alt={file.path} />;
};
