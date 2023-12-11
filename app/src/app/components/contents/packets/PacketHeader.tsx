import { capitalizeFirstLetter } from "../../../../lib/string/capitalizeFirstLetter";

interface PacketHeaderProps {
  packetName: string;
  packetId: string;
}

export default function PacketHeader({ packetName, packetId }: PacketHeaderProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{capitalizeFirstLetter(packetName)}</h2>
      <p className="text-muted-foreground">{packetId}</p>
    </div>
  );
}
