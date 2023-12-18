import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthConfig } from "../providers/AuthConfigProvider";
import { useUser } from "../providers/UserProvider";

export default function ProtectedRoute() {
  const navigate = useNavigate();
  const authConfig = useAuthConfig();
  const { user } = useUser();

  useEffect(() => {
    if (authConfig?.enableAuth) {
      if (!user?.token) {
        navigate("/login");
      }
    }
  }, [navigate, authConfig, user?.token]);

  return <Outlet />;
}
