import { cn } from "../../../../lib/cn";
import { MultiSelectorItem, MultiSelectorList } from "../../Base/MultiSelect";
import { BasicRolesAndUsers } from "../admin/types/RoleWithRelationships";

interface UpdatePacketReadPermissionMultiSelectListProps {
  rolesAndUsers: BasicRolesAndUsers;
}
export const UpdatePacketReadPermissionMultiSelectList = ({
  rolesAndUsers
}: UpdatePacketReadPermissionMultiSelectListProps) => {
  return (
    <MultiSelectorList>
      {[...rolesAndUsers.roles, ...rolesAndUsers.users].map((userRole) => {
        const isUser = "username" in userRole;
        return (
          <MultiSelectorItem
            className={cn(isUser ? "text-[#2C5282] dark:text-[#90CDF4]" : "text-[#7B341E] dark:text-[#FBD38D]")}
            key={userRole.id}
            value={isUser ? userRole.username : userRole.name}
          >
            <div className="flex justify-between w-full">
              <span>{isUser ? userRole.username : userRole.name}</span>
              <span className="text-muted-foreground ">{isUser ? "User" : "Role"}</span>
            </div>
          </MultiSelectorItem>
        );
      })}
    </MultiSelectorList>
  );
};
