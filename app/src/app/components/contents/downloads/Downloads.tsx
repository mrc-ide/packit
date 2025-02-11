import { useParams } from "react-router-dom";
import { usePacketOutletContext } from "../../main/PacketOutlet";
import { PacketHeader } from "../packets";
import { Card, CardContent } from "../../Base/Card";
import { FileRow } from "./FileRow";
import { OrderlyDownloads } from "./orderly/OrderlyDownloads";
import { FileGroupDownloadButton } from "./orderly/FileGroupDownloadButton";

export const Downloads = () => {
  const { packetId, packetName } = useParams();
  const { packet } = usePacketOutletContext();
  const packetIsFromOrderly = !!packet?.custom?.orderly;

  return (
    <>
      {packet && (
        <>
          <div className="md:flex justify-between">
            <PacketHeader packetName={packetName ?? ""} packetId={packetId ?? ""} displayName={packet.displayName} />
            <span className="self-end">
              <FileGroupDownloadButton
                files={packet.files}
                zipName={`${packetName}_${packetId}.zip`}
                buttonText="Download all files"
              />
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
                        <FileRow file={file} />
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
