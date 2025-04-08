import { Separator } from "../../Base/Separator";
import { UserWithRoles } from "../manageAccess/types/UserWithRoles";

interface PacketReadUsersListProps {
  users: UserWithRoles[];
}
export const PacketReadUsersList = ({ users }: PacketReadUsersListProps) => {
  return (
    <div className="space-y-2 flex flex-col">
      <div>
        <h3 className="font-semibold tracking-tight">Specific users with read access</h3>
        <p className="text-muted-foreground text-sm">Users granted access based on an individual basis</p>
      </div>
      <div className="max-h-64 rounded-md border p-4 md:max-w-lg overflow-auto">
        {users.map((user) => (
          <div key={user.id} className="flex flex-col">
            <div className="text-sm">{user.username}</div>
            <Separator className="my-3" />
          </div>
        ))}
      </div>
    </div>
  );
};
