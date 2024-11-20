import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { authIsPreExpiry, isAuthenticated } from "../../../lib/isAuthenticated";
import { useAuthConfig } from "../providers/AuthConfigProvider";
import { useUser } from "../providers/UserProvider";
import { useRedirectOnLogin } from "../providers/RedirectOnLoginProvider";

export default function ProtectedRoute() {
  const navigate = useNavigate();
  const authConfig = useAuthConfig();
  const { user, removeUser } = useUser();
  const { setRequestedUrl, loggingOut } = useRedirectOnLogin();
  const { pathname } = useLocation();
  const expiryMessage = "You have been signed out because your session expired. Please log in."

  useEffect(() => {
    if (authConfig && !isAuthenticated(authConfig, user)) {
      // we will redirect to requested url on login, but avoid doing this if logging out after previous auth success
      if (!loggingOut) {
        setRequestedUrl(pathname);
      }
      if (user && !authIsPreExpiry(user)) {
        removeUser()
        navigate(`/login?info=${expiryMessage}`);
      } else {
        navigate("/login");
      }
    }
  }, [navigate, authConfig, user]);

  return isAuthenticated(authConfig, user) ? <Outlet /> : null;
}
