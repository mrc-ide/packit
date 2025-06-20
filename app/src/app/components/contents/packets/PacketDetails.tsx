import { useParams } from "react-router-dom";
import { Accordion } from "../../Base/Accordion";
import { Separator } from "../../Base/Separator";
import { usePacketOutletContext } from "../../main/PacketLayout";
import { PacketDependencies } from "./PacketDependencies";
import { PacketHeader } from "./PacketHeader";
import { PacketParameters } from "./PacketParameters";
import { PacketReports } from "./PacketReports";

export const PacketDetails = () => {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();
  const longDescription = packet?.custom?.orderly.description.long;

  return (
    <>
      <PacketHeader packetName={packetName ?? ""} packetId={packetId ?? ""} displayName={packet?.displayName} />
      {longDescription && (
        <div>
          <p>{longDescription}</p>
          <Separator className="mt-3" />
        </div>
      )}
      <Accordion type="multiple" defaultValue={["parameters", "dependencies", "reports"]}>
        <PacketParameters parameters={packet?.parameters ?? {}} />
        <PacketDependencies depends={packet?.depends ?? []} />
        <PacketReports packet={packet} />
      </Accordion>
    </>
  );
};
