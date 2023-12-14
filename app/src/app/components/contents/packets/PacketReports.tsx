import { Fullscreen } from "lucide-react";
import { NavLink } from "react-router-dom";
import appConfig from "../../../../config/appConfig";
import { PacketMetadata } from "../../../../types";
import { getHtmlFilePath } from "./utils/getHtmlFilePath";

interface PacketReportsProps {
  packet: PacketMetadata | undefined;
}
// TODO : Fix Auth for files ++ add ability to load multiple reports.
export const PacketReports = ({ packet }: PacketReportsProps) => {
  const htmlFilePath = packet ? getHtmlFilePath(packet) : null;

  return (
    <div>
      <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">Reports</h4>
      {htmlFilePath ? (
        <div className="h-screen">
          <iframe className="w-full h-2/3" src={`${appConfig.apiUrl()}/${htmlFilePath}`}></iframe>
          <div className="py-2 flex justify-end">
            <NavLink
              className="text-blue-500 flex items-center gap-1
        hover:underline decoration-blue-500"
              to={`${appConfig.apiUrl()}/${htmlFilePath}`}
            >
              <Fullscreen size={20} />
              View Fullscreen
            </NavLink>
          </div>
        </div>
      ) : (
        <div className="italic text-sm">None</div>
      )}
    </div>
  );
};