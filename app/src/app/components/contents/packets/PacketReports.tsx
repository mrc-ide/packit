import { Fullscreen } from "lucide-react";
import appConfig from "../../../../config/appConfig";
import { PacketMetadata } from "../../../../types";
import { getHtmlFilePath } from "./utils/getHtmlFilePath";
import {getFileObjectUrl} from "../../../../lib/download";
import {useEffect, useState} from "react";

interface PacketReportsProps {
  packet: PacketMetadata | undefined;
}
// TODO: add ability to load multiple reports (html files).
export const PacketReports = ({ packet }: PacketReportsProps) => {
  const htmlFilePath = packet ? getHtmlFilePath(packet) : null;

  const [htmlFileObjectUrl, setHtmlFileObjectUrl] = useState(undefined as string | undefined);
  const getHtmlFileObjectUrl = async () => {
    if (htmlFilePath) {
      setHtmlFileObjectUrl(await getFileObjectUrl(`${appConfig.apiUrl()}/${htmlFilePath}`, ""));
    }
  };

  useEffect(() => {
    getHtmlFileObjectUrl();
  }, [packet]);

  return (
    <div>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Reports</h4>
      {htmlFileObjectUrl ? (
        <div className="h-screen">
          <iframe className="w-full h-2/3 border" data-testid="report-iframe" src={htmlFileObjectUrl}></iframe>
          <div className="py-2 flex justify-end">
            <a
              className="text-blue-500 flex items-center gap-1
        hover:underline decoration-blue-500"
              href={`${htmlFileObjectUrl}`}
            >
              <Fullscreen size={20} />
              View Fullscreen
            </a>
          </div>
        </div>
      ) : (
        <div className="italic text-sm">None</div>
      )}
    </div>
  );
};
