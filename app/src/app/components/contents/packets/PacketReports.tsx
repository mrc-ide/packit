import { Fullscreen, Presentation } from "lucide-react";
import { useEffect, useState } from "react";
import { FileMetadata, PacketMetadata } from "../../../../types";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../Base/Accordion";
import { PacketReport } from "./PacketReport";
import { getHtmlFileIfExists } from "./utils/htmlFile";
import { NavLink } from "react-router-dom";

interface PacketReportsProps {
  packet: PacketMetadata | undefined;
}

// TODO: add ability to load multiple reports (html files).
export const PacketReports = ({ packet }: PacketReportsProps) => {
  const [htmlFile, setHtmlFile] = useState<FileMetadata | undefined>(undefined);

  useEffect(() => {
    setHtmlFile(packet ? getHtmlFileIfExists(packet) : undefined);
  }, [packet]);

  return (
    <AccordionItem value="reports">
      <AccordionTrigger>
        <span className="flex gap-1 items-center">
          <Presentation className="small-icon text-muted-foreground" />
          <h3>Reports</h3>
        </span>
      </AccordionTrigger>
      <AccordionContent>
        {packet && htmlFile ? (
          <div className="h-screen">
            <div className="w-full h-2/3 border">
              <PacketReport fileHash={htmlFile.hash} packet={packet}></PacketReport>
            </div>
            <div className="py-2 flex justify-end">
              <NavLink
                className="text-blue-500 flex items-center gap-1
        hover:underline decoration-blue-500"
                to={`/${packet.name}/${packet.id}/file/${htmlFile.path}`}
              >
                <Fullscreen size={20} />
                View Fullscreen
              </NavLink>
            </div>
          </div>
        ) : (
          <div className="italic text-sm">None</div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};
