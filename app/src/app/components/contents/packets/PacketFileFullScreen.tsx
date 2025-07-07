import { Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { HttpStatus } from "@lib/types/HttpStatus";
import { useGetPacketById } from "../../main/hooks/useGetPacketById";
import { ErrorPage } from "../common/ErrorPage";
import { Unauthorized } from "../common/Unauthorized";
import { getFileByPath } from "../downloads/utils/getFileByPath";
import { PacketFileFullScreenContent } from "./PacketFileFullScreenContent";

export const PacketFileFullScreen = () => {
  // The * (or 'splat') parameter lets us handle file paths that contain slashes.
  const { "*": filePath, packetId } = useParams();
  const { packet, isLoading, error } = useGetPacketById(packetId);
  const file = getFileByPath(filePath ?? "", packet);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (error?.status === HttpStatus.Unauthorized) return <Unauthorized />;
  if (error || !file) return <ErrorPage error={error} message="Error fetching file details or file not found" />;

  return packet ? (
    <div className="h-screen">
      <PacketFileFullScreenContent file={file} packet={packet} />
    </div>
  ) : null;
};
