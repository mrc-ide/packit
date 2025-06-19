import { NavLink, useParams } from "react-router-dom";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { PacketHeader } from "./PacketHeader";
import { PacketParameters } from "./PacketParameters";
import { PacketReports } from "./PacketReports";
import { Separator } from "../../Base/Separator";
import { PacketDependencies } from "./PacketDependencies";
import { Accordion } from "../../Base/Accordion";
import { buttonVariants } from "../../Base/Button";

// TODO: link back to packet run logs. only show if user has packet.run permission and the packet has a run log
export const PacketDetails = () => {
  const { packetId, packetName } = useParams();
  const { packet, runTaskId } = usePacketOutletContext();
  const longDescription = packet?.custom?.orderly.description.long;

  return (
    <>
      <div className="md:flex justify-between">
        <div>
          <PacketHeader packetName={packetName ?? ""} packetId={packetId ?? ""} displayName={packet?.displayName} />
          {longDescription && (
            <div>
              <p>{longDescription}</p>
              <Separator className="mt-3" />
            </div>
          )}
        </div>
        {runTaskId && (
          <NavLink to={`/runner/logs/${runTaskId}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
            View run logs
          </NavLink>
        )}
      </div>
      <Accordion type="multiple" defaultValue={["parameters", "dependencies", "reports"]}>
        <PacketParameters parameters={packet?.parameters ?? {}} />
        <PacketDependencies depends={packet?.depends ?? []} />
        <PacketReports packet={packet} />
      </Accordion>
    </>
  );
};
