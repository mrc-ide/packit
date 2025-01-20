import { useParams } from "react-router-dom";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { PacketHeader } from "../packets";
import { Card, CardContent } from "../../Base/Card";
import { FileRow } from "./FileRow";
import { OrderlyDownloads } from "./orderly/OrderlyDownloads";

export const Downloads = () => {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();
  const packetIsFromOrderly = !!packet?.custom?.orderly;

  return (
    <>
      {packet && (
        <>
          <PacketHeader packetName={packetName ?? ""} packetId={packetId ?? ""} displayName={packet.displayName} />
          {packetIsFromOrderly && <OrderlyDownloads />}
          {!packetIsFromOrderly && (
            <>
              <h3>Downloads</h3>
              <Card>
                <CardContent className="p-0">
                  <ul>
                    {packet.files.map((file, index) => (
                      <li key={index}>
                        <FileRow path={file.path} />
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </>
  );
};
