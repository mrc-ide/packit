import { PacketMetadata } from "../../../../types";
import { useFileObjectUrl } from "./hooks/useFileObjectUrl";

interface ImageTabProps {
  packet: PacketMetadata;
  fileHash: string;
}

export const ImageTab = ({ packet, fileHash }: ImageTabProps) => {
  const file = packet.files.filter((file) => file.hash === fileHash)[0];
  const fileObjectUrl = useFileObjectUrl(packet, file);

  return (
    <>
      <p>{file.path}</p>
      <img src={fileObjectUrl} />
    </>
  );
};
