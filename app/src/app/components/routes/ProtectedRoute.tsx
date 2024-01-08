import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../../../lib/isAuthenticated";
import { useAuthConfig } from "../providers/AuthConfigProvider";
import { useUser } from "../providers/UserProvider";

export default function ProtectedRoute() {
  const navigate = useNavigate();
  const authConfig = useAuthConfig();
  const { user, setRequestedUrl, loggingOut } = useUser();
  const { pathname } = useLocation();

  useEffect(() => {
    if (!authConfig ) {
      // not initialised
      //console.log("not initialised")
      return;
    } else if (!isAuthenticated(authConfig, user)) {
      if (!loggingOut && pathname !== "/") {
        // we will redirect to requested url on login, but avoid doing this if logging out after previous auth success
        //console.log("setting requested url to " + pathname)
        setRequestedUrl(pathname);
        //sessionStorage.setItem("requestedUrlDirect", pathname)
      }
      navigate("/login");
    }
  }, [navigate, authConfig, user]);

  return isAuthenticated(authConfig, user) ? <Outlet /> : null;
}
