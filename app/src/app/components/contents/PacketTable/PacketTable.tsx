import { useParams } from "react-router-dom";
import useSWR from "swr";
import { fetcher } from "../../../../lib/fetch";
import appConfig from "../../../../config/appConfig";
import { PageablePackets } from "../../../../types";

export const PacketTable = () => {
  const { packetName } = useParams();
  const { data, isLoading, error } = useSWR<PageablePackets>(
    `${appConfig.apiUrl()}/packets/${packetName}?pageNumber=0&pageSize=50&filterByStatusPublished=false&filterId=`,
    (url: string) => fetcher({ url, authRequired: true })
  );

  if (error) return <div>Error fetching packet</div>;
  if (isLoading) return <div>Loading packet...</div>;

  return (
    <div>
      {data?.content?.map((packet) => (
        <div key={packet.id}>
          {packet.name} {packet.id} - {packet.published}
          {Object.entries(packet.parameters).map(([key, val]) => (
            <div key={key}>
              {key} - {val}{" "}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
