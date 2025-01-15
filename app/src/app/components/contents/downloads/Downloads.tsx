import { useParams } from "react-router-dom";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { PacketHeader } from "../packets";
import { Card, CardContent } from "../../Base/Card";
import { FileRow } from "./FileRow";
import { OrderlyDownloads } from "./orderly/OrderlyDownloads";
import { DownloadAllFilesButton } from "./orderly/DownloadAllFilesButton";

export const Downloads = () => {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();
  const packetIsFromOrderly = !!packet?.custom?.orderly;

  return (
    <div className="space-y-0">
      {packet && (
        <>
          <PacketHeader packetName={packetName ?? ""} packetId={packetId ?? ""} displayName={packet.displayName} />
          <div className="flex flex-col">
            <span className="self-end mb-2">
              <DownloadAllFilesButton />
            </span>
          </div>
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
    </div>
  );
};
