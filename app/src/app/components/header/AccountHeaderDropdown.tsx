import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../types";
import { logout } from "../../store/login/login";
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

export default function AccountHeaderDropdown() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <DropdownMenu data-testid="test1">
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>LA</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            {/* TODO: get info from jwt */}
            <p className="text-base font-medium leading-none">Lekan</p>
            <p className="text-sm leading-none text-muted-foreground">l.ani@imperial.ac.uk</p>
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
