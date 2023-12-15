import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../../../localStorageManager";
import { RootState, useAppDispatch } from "../../../types";
import { saveUser } from "../../store/login/login";
import { actions } from "../../store/login/loginThunks";

export default function ProtectedRoute() {
  const navigate = useNavigate();
  const { isAuthenticated, authConfig } = useSelector((state: RootState) => state.login);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(actions.fetchAuthConfig());
  }, []);

  useEffect(() => {
    const user = getCurrentUser();

    if (authConfig.enableAuth) {
      if (!isAuthenticated && !user?.token) {
        navigate("/login");
        return;
      }

      if (user && user.token) {
        dispatch(saveUser(user));
      }
    }
  }, [navigate, authConfig]);

  return <Outlet />;
}
