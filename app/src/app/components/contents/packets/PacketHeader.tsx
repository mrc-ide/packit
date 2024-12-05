interface PacketHeaderProps {
  displayName: string;
  packetName: string;
  packetId: string;
}

export default function PacketHeader({ displayName, packetName, packetId }: PacketHeaderProps) {
  if (displayName.length === 0 || displayName === packetName) {
    return (
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{packetName}</h2>
        <p className="text-muted-foreground">{packetId}</p>
      </div>
    );
  } else {
    return (
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{displayName}</h2>
        <p>
          <span className="text-muted-foreground">{packetName}</span>
          <span> · </span>
          <span className="text-muted-foreground">{packetId}</span>
        </p>
      </div>
  )
  }
};
