import { getHtmlFileIfExists } from "./utils/htmlFile";
import { ErrorComponent } from "../common/ErrorComponent";
import { PacketMetadata } from "../../../../types";
import { useFileObjectUrl } from "../downloads/hooks/useFileObjectUrl";

const defaultErrorMessage = "Error loading report";

interface PacketReportProps {
  packet: PacketMetadata;
  fileHash: string;
}

// NB Currently we only support displaying the first html file in a packet, but we may support multiple
// in future
export const PacketReport = ({ packet, fileHash }: PacketReportProps) => {
  const file = getHtmlFileIfExists(packet);
  if (file?.hash !== fileHash)
    return <ErrorComponent message={defaultErrorMessage} error={new Error("File not found")} />;

  const { fileObjectUrl, error } = useFileObjectUrl(file);

  if (error) return <ErrorComponent message={defaultErrorMessage} error={error} />;

  return (
    (fileObjectUrl && <iframe className="w-full h-full" data-testid="report-iframe" src={fileObjectUrl}></iframe>) ||
    null
  );
};
