import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { authIsExpired, isAuthenticated } from "../../../lib/isAuthenticated";
import { useAuthConfig } from "../providers/AuthConfigProvider";
import { useUser } from "../providers/UserProvider";
import { useRedirectOnLogin } from "../providers/RedirectOnLoginProvider";
import { windowNavigate } from "../../../lib/navigate";

export const ProtectedRoute = () => {
  const navigate = useNavigate();
  const authConfig = useAuthConfig();
  const { user, removeUser } = useUser();
  const { setRequestedUrl, loggingOut } = useRedirectOnLogin();
  const { pathname } = useLocation();
  const expiryMessage = "You have been signed out because your session expired. Please log in.";

  const navigateToLogin = (qs = "") => {
    // navigate to logged out screen, either using react routing or external navigation, depending on whether we're
    // using pre-auth, which may require logout action from auth provider. (See /packit/logout route in montagu nginx
    // conf for how this works with Montagu: https://github.com/vimc/montagu-proxy/blob/master/nginx.montagu.conf)
    if (authConfig?.enablePreAuthLogin) {
      const href = `${import.meta.env.BASE_URL}logout`;
      windowNavigate(href);
    } else {
      navigate(`/login${qs}`);
    }
  };

  useEffect(() => {
    if (authConfig && !isAuthenticated(authConfig, user)) {
      // we will redirect to requested url on login, but avoid doing this if logging out after previous auth success
      if (!loggingOut) {
        setRequestedUrl(pathname);
      }
      if (user && authIsExpired(user)) {
        removeUser();
        navigateToLogin(`?info=${expiryMessage}`);
      } else {
        navigateToLogin();
      }
    }
  }, [navigate, authConfig, user]);

  return isAuthenticated(authConfig, user) ? <Outlet /> : null;
};
