import { getHtmlFileIfExists, getHtmlFilePath } from "./utils/htmlFile";
import { useEffect, useState } from "react";
import { ErrorComponent } from "../common/ErrorComponent";
import { getFileObjectUrl } from "../../../../lib/download";
import appConfig from "../../../../config/appConfig";
import { PacketMetadata } from "../../../../types";

interface PacketReportProps {
  packet: PacketMetadata;
  fileHash: string;
}

// NB Currently we only support displaying the first html file in a packet, but we may support multiple
// in future
export const PacketReport = ({ packet, fileHash }: PacketReportProps) => {
  const [error, setError] = useState<null | Error>(null);
  const [htmlFileObjectUrl, setHtmlFileObjectUrl] = useState(undefined as string | undefined);

  const getHtmlFileObjectUrl = async (packet: PacketMetadata) => {
    const htmlFilePath = getHtmlFilePath(packet);
    getFileObjectUrl(`${appConfig.apiUrl()}/${htmlFilePath}`, "")
      .then((url) => {
        setError(null);
        setHtmlFileObjectUrl(url);
      })
      .catch((e) => {
        setError(e);
      });
  };

  useEffect(() => {
    const file = getHtmlFileIfExists(packet);
    if (file?.hash != fileHash) {
      setError(new Error("File name not found"));
    } else {
      getHtmlFileObjectUrl(packet);
    }
  }, [packet, fileHash]);

  return (
    <>
      {htmlFileObjectUrl ? (
        <iframe className="w-full h-full" data-testid="report-iframe" src={htmlFileObjectUrl}></iframe>
      ) : error ? (
        <ErrorComponent message="Error loading report" error={error} />
      ) : null}
    </>
  );
};
