import { useParams } from "react-router-dom";
import { useGetPacketById } from "../common/hooks/useGetPacketById";
import { ErrorComponent } from "../common/ErrorComponent";
import { PacketReport } from "./PacketReport";
import { ImageTab } from "../downloads/ImageTab";
import { filePathToExtension, imageExtensions } from "../downloads/utils/extensions";

export const PacketFileFullScreen = () => {
  const { packetId, fileHash } = useParams();
  const { packet, error } = useGetPacketById(packetId);

  if (error || !packet) {
    return <ErrorComponent error={error} message="Error fetching Packet details" />;
  }

  const file = packet.files.filter((file) => file.hash === fileHash)[0];
  const extension = file ? filePathToExtension(file.path) : "";
  const isImageFile = imageExtensions.includes(extension);
  const isHtmlFile = extension === "html";

  return fileHash ? (
    <div className="h-screen">
      {isImageFile && <ImageTab packet={packet} fileHash={fileHash} />}
      {isHtmlFile && <PacketReport packet={packet} fileHash={fileHash} />}
    </div>
  ) : null;
};
