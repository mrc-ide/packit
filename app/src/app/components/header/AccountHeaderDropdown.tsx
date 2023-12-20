import { useNavigate } from "react-router-dom";
import { getInitials } from "../../../lib/string";
import { Avatar, AvatarFallback } from "../Base/Avatar";
import { Button } from "../Base/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../Base/DropdownMenu";
import { useUser } from "../providers/UserProvider";

export function AccountHeaderDropdown() {
  const navigate = useNavigate();
  const { removeUser, user } = useUser();

  const handleLogout = () => {
    removeUser();
    navigate("/login");
  };

  return (
    <DropdownMenu data-testid="test1">
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials(user?.displayName ?? "X X")}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-base font-medium leading-none">{user?.displayName}</p>
            <p className="text-sm leading-none text-muted-foreground">{user?.userName}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className="text-base">Manage Access</DropdownMenuItem>
          <DropdownMenuItem className="text-base">Publish Packets</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-base" onClick={handleLogout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
