import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { authIsExpired, isAuthenticated } from "../../../lib/isAuthenticated";
import { useAuthConfig } from "../providers/AuthConfigProvider";
import { useUser } from "../providers/UserProvider";
import { useRedirectOnLogin } from "../providers/RedirectOnLoginProvider";

export const ProtectedRoute = () => {
  const navigate = useNavigate();
  const authConfig = useAuthConfig();
  const { user, removeUser } = useUser();
  const { setRequestedUrl, loggingOut } = useRedirectOnLogin();
  const { pathname } = useLocation();
  const expiryMessage = "You have been signed out because your session expired. Please log in.";

  const unauthenticatedNavigate = (qs = "") => {
    // navigate to logout screen, either using react routing or external navigation, depending on whether we're
    // using pre-auth
    if (authConfig?.enablePreAuthLogin) {
      // Two possible scenarios:
      // 1. user is deliberately logging out - redirect to packit on login not required. Montagu logout is required.
      // 2. login has expired or is not authenticated. Redirect to packit on login is required. Montagu logout may also
      // be required.
      const location = loggingOut ? "logout" : "logout?packitRedirect=1";

      window.location.href = `${process.env.PUBLIC_URL}/${location}`;
    } else {
      navigate(`/login${qs}`);
    }
  }

  useEffect(() => {
    if (authConfig && !isAuthenticated(authConfig, user)) {
      // we will redirect to requested url on login, but avoid doing this if logging out after previous auth success
      if (!loggingOut) {
        setRequestedUrl(pathname);
      }
      if (user && authIsExpired(user)) {
        removeUser();
        unauthenticatedNavigate(`?info=${expiryMessage}`);
      } else {
        unauthenticatedNavigate();
      }
    }
  }, [navigate, authConfig, user]);

  return isAuthenticated(authConfig, user) ? <Outlet /> : null;
};
