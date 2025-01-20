import { BookOpenText, Fullscreen } from "lucide-react";
import { FileMetadata, PacketMetadata } from "../../../../types";
import { getHtmlFileIfExists } from "./utils/htmlFile";
import { useEffect, useState } from "react";
import { PacketReport } from "./PacketReport";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../Base/Accordion";

interface PacketReportsProps {
  packet: PacketMetadata | undefined;
}
// TODO: add ability to load multiple reports (html files).
export const PacketReports = ({ packet }: PacketReportsProps) => {
  const [htmlFile, setHtmlFile] = useState<FileMetadata | null>(null);

  useEffect(() => {
    setHtmlFile(packet ? getHtmlFileIfExists(packet) : null);
  }, [packet]);

  return (
    <AccordionItem value="reports">
      <AccordionTrigger>
        <span className="flex gap-1 items-center">
          <BookOpenText className="small-icon text-muted-foreground" />
          <h3>Reports</h3>
        </span>
      </AccordionTrigger>
      <AccordionContent>
        {packet && htmlFile ? (
          <div className="h-screen">
            <div className="w-full h-2/3 border">
              <PacketReport fileName={htmlFile.path} packet={packet}></PacketReport>
            </div>
            <div className="py-2 flex justify-end">
              <a
                className="text-blue-500 flex items-center gap-1
        hover:underline decoration-blue-500"
                href={`${packet.id}/file/${htmlFile.path}`}
              >
                <Fullscreen size={20} />
                View Fullscreen
              </a>
            </div>
          </div>
        ) : (
          <div className="italic text-sm">None</div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};
