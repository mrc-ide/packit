import { PacketMetadata } from "../../../../types";

interface PacketHeaderProps {
  packet: PacketMetadata;
}

export default function PacketHeader({ packet }: PacketHeaderProps) {
  return (
    <>
      <div className="pb-3 d-flex flex-column align-items-start">
        <span className="p-2 pb-0 h1">{packet.custom?.orderly.description.display || packet.name}</span>
        <span className="p-2 pt-0 small">{packet.id}</span>
      </div>
    </>
  );
}
