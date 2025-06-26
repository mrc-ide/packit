import { useUser } from "../../providers/UserProvider";
import { hasGlobalPacketManagePermission } from "../../../../lib/auth/hasPermission";
import { Unauthorized } from "../common/Unauthorized";
import { ResyncPacketsButton } from "./ResyncPacketsButton";

export const ResyncPackets = () => {
  const { authorities } = useUser();
  if (!hasGlobalPacketManagePermission(authorities)) {
    return <Unauthorized />;
  } else {
    return (
      <>
        <h2 className="text-2xl font-bold tracking-tight">Resync Packets</h2>
        <p className="text-muted-foreground">
          This operation can be used to synchronise Packit&apos;s data store with an outpack server which has been
          pulled from another location. Resync may take a while if there are a lot of differences with outpack.
        </p>
        <ResyncPacketsButton />
      </>
    );
  }
};
