import { PacketMetadata } from "../../../../types";
import { useFileObjectUrl } from "./hooks/useFileObjectUrl";

interface ImageDisplayProps {
  packet: PacketMetadata;
  fileHash: string;
}

export const ImageDisplay = ({ packet, fileHash }: ImageDisplayProps) => {
  const file = packet.files.filter((file) => file.hash === fileHash)[0];
  const { fileObjectUrl, error } = useFileObjectUrl(file);

  return fileObjectUrl && <img src={fileObjectUrl} alt={file.path} />;
};
