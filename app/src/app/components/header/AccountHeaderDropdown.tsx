import { getInitials } from "../../../lib/string";
import { Avatar, AvatarFallback } from "../Base/Avatar";
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
import {useAuthConfig} from "../providers/AuthConfigProvider";
import {useNavigate} from "react-router-dom";

export const AccountHeaderDropdown = () => {
  const { removeUser, user } = useUser();
  const { setLoggingOut } = useRedirectOnLogin();
  const authConfig = useAuthConfig();
  const navigate = useNavigate();

  const handleLogout = () => {
    removeUser();
    setLoggingOut(true);
    if (authConfig?.enablePreAuthLogin) {
        // Go to external login via server, and set loggingOut so that the external auth manager (e.g. Montagu) knows
        // to log out too
        window.location.href = `${process.env.PUBLIC_URL}/login?loggingOut=1`;
    } else {
        navigate("/login");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
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
