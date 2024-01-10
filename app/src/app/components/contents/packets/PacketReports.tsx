import { Fullscreen } from "lucide-react";
import {FileMetadata, PacketMetadata} from "../../../../types";
import {getHtmlFileIfExists, getHtmlFilePath} from "./utils/htmlFile";
import {useEffect, useState} from "react";
import {PacketReport} from "./PacketReport";

interface PacketReportsProps {
  packet: PacketMetadata | undefined;
}
// TODO: add ability to load multiple reports (html files).
export const PacketReports = ({ packet }: PacketReportsProps) => {
  const [htmlFile, setHtmlFile] = useState<FileMetadata | null >(null);

  useEffect(() => {
    setHtmlFile(packet ? getHtmlFileIfExists(packet) : null);
  }, [packet]);

  return (
    <div>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Reports</h4>
      {htmlFile ? (
        <div className="h-screen">
          <div className="w-full h-2/3 border">
            <PacketReport fileName={htmlFile.path}></PacketReport>
          </div>
          <div className="py-2 flex justify-end">
            <a
              className="text-blue-500 flex items-center gap-1
        hover:underline decoration-blue-500"
              href={`${"/todo"}`}
            >
              <Fullscreen size={20} />
              View Fullscreen
            </a>
          </div>
        </div>
      ) : (
            <div className="italic text-sm">None</div>
          )
      }
    </div>
  );
};
