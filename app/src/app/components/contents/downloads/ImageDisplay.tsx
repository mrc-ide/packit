import { PacketMetadata } from "../../../../types";
import { useFileObjectUrl } from "./hooks/useFileObjectUrl";
import { ErrorComponent } from "../common/ErrorComponent";

const defaultErrorMessage = "Error loading image file";

interface ImageDisplayProps {
  packet: PacketMetadata;
  fileHash: string;
}

export const ImageDisplay = ({ packet, fileHash }: ImageDisplayProps) => {
  const file = packet.files.filter((file) => file.hash === fileHash)[0];
  if (!file) return <ErrorComponent message={defaultErrorMessage} error={new Error("File not found")} />;

  const { fileObjectUrl, error } = useFileObjectUrl(file);

  if (error) return <ErrorComponent message={defaultErrorMessage} error={error} />;

  return (fileObjectUrl && <img src={fileObjectUrl} alt={file.path} />) || null;
};
