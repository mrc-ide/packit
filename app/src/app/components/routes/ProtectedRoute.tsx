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

  useEffect(() => {
    if (authConfig && !isAuthenticated(authConfig, user)) {
      // we will redirect to requested url on login, but avoid doing this if logging out after previous auth success
      if (!loggingOut) {
        setRequestedUrl(pathname);
      }
      if (user && authIsExpired(user)) {
        removeUser();
        navigate(`/login?info=${expiryMessage}`);
      } else {
        //navigate("/login");
        // TODO: sort this out! should go to backend on expiry too if preauth
        if (authConfig?.enablePreAuthLogin) {
          // Require external auth logout route to be configured e.g. in Montagu proxy
          const logoutLocation = `${process.env.PUBLIC_URL}/logout`;
          console.log(logoutLocation);

          window.location.href = logoutLocation;
        } else {
          navigate("/login");
        }
      }
    }
  }, [navigate, authConfig, user]);

  return isAuthenticated(authConfig, user) ? <Outlet /> : null;
};
