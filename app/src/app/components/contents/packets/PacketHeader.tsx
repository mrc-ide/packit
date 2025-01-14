interface PacketHeaderProps {
  packetName: string;
  packetId: string;
  displayName?: string;
}

export default function PacketHeader({ packetName, packetId, displayName }: PacketHeaderProps) {
  if (!displayName || displayName === packetName) {
    return (
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{packetName}</h2>
        <p className="text-muted-foreground">{packetId}</p>
      </div>
    );
  }
  return (
    <div>
      <h2 className="text-2xl font-bold tracking-tight">{displayName}</h2>
      <p>
        <span className="text-muted-foreground">{packetName}</span>
        <span> · </span>
        <span className="text-muted-foreground">{packetId}</span>
      </p>
    </div>
  );
}
