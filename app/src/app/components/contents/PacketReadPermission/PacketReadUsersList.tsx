import { Separator } from "@components/Base/Separator";
import { BasicUser } from "../manageAccess/types/RoleWithRelationships";

interface PacketReadUsersListProps {
  users: BasicUser[];
}
export const PacketReadUsersList = ({ users }: PacketReadUsersListProps) => {
  return (
    <div className="space-y-2 flex flex-col">
      <div>
        <h3 className="font-semibold tracking-tight">Specific users with read access</h3>
        <p className="text-muted-foreground text-sm">Users granted access on an individual basis</p>
      </div>
      <div className="max-h-64 rounded-md border p-4 md:max-w-lg overflow-auto">
        {users.length == 0 ? (
          <div className="italic">None</div>
        ) : (
          users.map((user) => (
            <div key={user.id} className="flex flex-col">
              <div className="text-sm">{user.username}</div>
              <Separator className="my-3" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
