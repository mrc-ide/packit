import { Dispatch, SetStateAction } from "react";
import { hasAnyPacketManagePermission } from "../../../../lib/auth/hasPermission";
import { HttpStatus } from "../../../../lib/types/HttpStatus";
import { Skeleton } from "../../Base/Skeleton";
import { useUser } from "../../providers/UserProvider";
import { ErrorComponent } from "../common/ErrorComponent";
import { Pagination } from "../common/Pagination";
import { Unauthorized } from "../common/Unauthorized";
import { PacketGroupSummaryListItem } from "./PacketGroupSummaryListItem";
import { useGetPacketGroupSummaries } from "./hooks/useGetPacketGroupSummaries";
import { useGetRolesAndUsersToUpdateRead } from "./hooks/useGetRolesAndUsersToUpdateRead";

interface PacketGroupSummaryListProps {
  filterByName: string;
  pageNumber: number;
  pageSize: number;
  setPageNumber: Dispatch<SetStateAction<number>>;
}
export const PacketGroupSummaryList = ({
  filterByName,
  pageNumber,
  pageSize,
  setPageNumber
}: PacketGroupSummaryListProps) => {
  const { user } = useUser();
  const rolesAndUsersToUpdateReadRes = hasAnyPacketManagePermission(user?.authorities)
    ? useGetRolesAndUsersToUpdateRead()
    : null;
  const {
    packetGroupSummaries,
    isLoading,
    error: packetFetchError
  } = useGetPacketGroupSummaries(pageNumber, pageSize, filterByName);

  if (
    packetFetchError?.status === HttpStatus.Unauthorized ||
    rolesAndUsersToUpdateReadRes?.error?.status === HttpStatus.Unauthorized
  )
    return <Unauthorized />;
  if (rolesAndUsersToUpdateReadRes?.error)
    return <ErrorComponent message="Error fetching roles and users" error={rolesAndUsersToUpdateReadRes.error} />;
  if (packetFetchError) return <ErrorComponent message="Error fetching packet groups" error={packetFetchError} />;

  if (isLoading)
    return (
      <ul className="flex flex-col border rounded-md">
        {[...Array(2)].map((_, index) => (
          <li key={index} className="p-4 flex flex-col border-b space-y-1">
            <Skeleton className="h-6 w-64" />
            <div className="flex space-x-3 items-center">
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
              <Skeleton className="h-3 w-12" />
            </div>
          </li>
        ))}
      </ul>
    );

  return (
    <>
      {packetGroupSummaries?.content?.length === 0 ? (
        <div className="flex border rounded-md p-6 justify-center text-muted-foreground">No reports found</div>
      ) : (
        <ul className="flex flex-col border rounded-md">
          {packetGroupSummaries?.content?.map((packetGroup) => (
            <PacketGroupSummaryListItem
              key={packetGroup.latestId}
              packetGroup={packetGroup}
              rolesAndUsersToUpdateReadRes={rolesAndUsersToUpdateReadRes}
            />
          ))}
        </ul>
      )}

      {packetGroupSummaries?.content.length ? (
        <div className="flex items-center justify-center">
          <Pagination
            currentPageNumber={pageNumber}
            totalPages={packetGroupSummaries.totalPages}
            isFirstPage={packetGroupSummaries.first}
            isLastPage={packetGroupSummaries.last}
            setPageNumber={setPageNumber}
          />
        </div>
      ) : null}
    </>
  );
};
