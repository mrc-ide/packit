import { getHtmlFileIfExists } from "./utils/htmlFile";
import { ErrorComponent } from "../common/ErrorComponent";
import { PacketMetadata } from "../../../../types";
import { useFileObjectUrl } from "../downloads/hooks/useFileObjectUrl";

interface PacketReportProps {
  packet: PacketMetadata;
  fileHash: string;
}

// NB Currently we only support displaying the first html file in a packet, but we may support multiple
// in future
export const PacketReport = ({ packet, fileHash }: PacketReportProps) => {
  const file = getHtmlFileIfExists(packet);
  if (file?.hash !== fileHash) {
    const error = new Error("File name not found");
    return <ErrorComponent message="Error loading report" error={error} />;
  }

  const { fileObjectUrl, error } = useFileObjectUrl(file);

  // TODO: Make sure we have tests for the error component existing

  return (
    <>
      {fileObjectUrl ? (
        <iframe className="w-full h-full" data-testid="report-iframe" src={fileObjectUrl}></iframe>
      ) : error ? (
        <ErrorComponent message="Error loading report" error={error} />
      ) : null}
    </>
  );
};
