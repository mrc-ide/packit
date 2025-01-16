import { useParams } from "react-router-dom";
import { useGetPacketById } from "../common/hooks/useGetPacketById";
import { ErrorComponent } from "../common/ErrorComponent";
import { PacketReport } from "./PacketReport";
import { ImageTab } from "../downloads/ImageTab";
import { filePathToExtension, imageExtensions } from "../downloads/utils/extensions";

export const PacketFileFullScreen = () => {
  const { packetId, fileHash } = useParams();
  const { packet, error } = useGetPacketById(packetId);

  if (error) {
    return <ErrorComponent error={error} message="Error Fetching Packet details" />;
  }

  const file = packet?.files.filter((file) => file.hash === fileHash)[0];
  let isImageFile = false;
  let isHtmlFile = false;
  if (file) {
    const extension = filePathToExtension(file.path);
    isImageFile = imageExtensions.includes(extension);
    isHtmlFile = extension === "html";
  }

  return packet && fileHash ? (
    <div className="h-screen">
      {isImageFile && <ImageTab packet={packet} fileHash={fileHash} />}
      {isHtmlFile && <PacketReport packet={packet} fileHash={fileHash} />}
    </div>
  ) : null;
};
