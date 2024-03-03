import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../../../lib/isAuthenticated";
import { useAuthConfig } from "../providers/AuthConfigProvider";
import { useUser } from "../providers/UserProvider";
import { useRedirectOnLogin } from "../providers/RedirectOnLoginProvider";

export default function ProtectedRoute() {
  const navigate = useNavigate();
  const authConfig = useAuthConfig();
  const { user } = useUser();
  const { setRequestedUrl, loggingOut } = useRedirectOnLogin();
  const { pathname } = useLocation();

  useEffect(() => {
    if (authConfig && !isAuthenticated(authConfig, user)) {
      // we will redirect to requested url on login, but avoid doing this if logging out after previous auth success
      if (!loggingOut) {
        setRequestedUrl(pathname);
      }
      // Force round trip to server (rather than using react routing) so montagu nginx config can redirect to montagu
      // index for login
      window.location.href = "/login";
      //navigate("/login");
    }
  }, [navigate, authConfig, user]);

  return isAuthenticated(authConfig, user) ? <Outlet /> : null;
}
