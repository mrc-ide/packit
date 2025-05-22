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
import { getInitials } from "../../../lib/string";

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
          variant="secondary"
          className="rounded-full h-10 w-10 tracking-wide border
            hover:opacity-90 hover:bg-accent hover:text-accent-foreground
            data-[state=open]:bg-accent data-[state=open]:text-accent-foreground
            "
        >
          {getInitials(user?.displayName)}
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
        <DropdownMenuItem className="text-base cursor-pointer" onClick={handleLogout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
