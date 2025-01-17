import { FileMetadata } from "../../../../types";
import { Link } from "react-router-dom";
import { ExternalLinkIcon } from "lucide-react";
import { usePacketOutletContext } from "../../main/PacketOutlet";

interface FileLinkProps {
  file: FileMetadata;
  fileName: string | undefined;
}

export const FileLink = ({ file, fileName }: FileLinkProps) => {
  const { packet } = usePacketOutletContext();

  return (
    <Link
      to={`/${packet?.name}/${packet?.id}/file/${file.path}`}
      target="_blank"
      className="flex truncate text-blue-500 hover:underline"
    >
      <span className="truncate">{fileName}</span>
      <ExternalLinkIcon size={15} className="min-w-fit ms-1" />
    </Link>
  );
};
