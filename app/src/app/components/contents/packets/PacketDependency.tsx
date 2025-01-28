import { Link } from "react-router-dom";
import { parseNameFromQuery } from "./utils/parseNameFromQuery";
import { PacketDepends } from "../../../../types";

interface PacketDependencyProps {
  dependency: PacketDepends;
}
export const PacketDependency = ({ dependency }: PacketDependencyProps) => {
  const packetName = parseNameFromQuery(dependency.query);
  return (
    <li key={dependency.packet}>
      <span className="font-semibold mr-2">{packetName}</span>
      <Link
        to={`/${packetName}/${dependency.packet}`}
        className="hover:underline decoration-blue-500 text-sm font-semibold text-blue-500"
      >
        {dependency.packet}
      </Link>
    </li>
  );
};
