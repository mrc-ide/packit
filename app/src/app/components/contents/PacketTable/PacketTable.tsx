import { useParams } from "react-router-dom";

export const PacketTable = () => {
  const { packetName } = useParams();
  return <div>PacketTable - name: {packetName}</div>;
};
