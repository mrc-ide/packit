import { Button } from "../Base/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "../Base/DropdownMenu";
import { useRedirectOnLogin } from "../providers/RedirectOnLoginProvider";
import { useUser } from "../providers/UserProvider";
import { CircleUser } from "lucide-react";

export const AccountHeaderDropdown = () => {
  const { removeUser, user } = useUser();
  const { setLoggingOut } = useRedirectOnLogin();

  const handleLogout = async () => {
    removeUser();
    setLoggingOut(true);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Account"
          variant="ghost"
          size="icon"
          className="rounded-full data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
        >
          <CircleUser />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p data-testid="user-display-name" className="text-base font-medium leading-none">
              {user?.displayName}
            </p>
            <p data-testid="username" className="text-sm leading-none text-muted-foreground">
              {user?.userName}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* <DropdownMenuGroup>
          <DropdownMenuItem className="text-base">Manage Access</DropdownMenuItem>
          <DropdownMenuItem className="text-base">Publish Packets</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator /> */}
        <DropdownMenuItem className="text-base" onClick={handleLogout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
