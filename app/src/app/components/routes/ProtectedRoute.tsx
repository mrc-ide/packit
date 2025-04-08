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

  const navigateToLogin = (qs = "") => {
    // navigate to logged out screen, either using react routing or external navigation, depending on whether we're
    // using pre-auth, which may require logout action from auth provider
    if (authConfig?.enablePreAuthLogin) {
      window.location.href = `${process.env.PUBLIC_URL}/logout`;
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
        navigateToLogin(`?info=${expiryMessage}`);
      } else {
        navigateToLogin();
      }
    }
  }, [navigate, authConfig, user]);

  return isAuthenticated(authConfig, user) ? <Outlet /> : null;
};
