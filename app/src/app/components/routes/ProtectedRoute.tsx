import React, {useEffect} from "react";
import {isExpired, decodeToken} from "react-jwt";
import {useNavigate, Outlet} from "react-router-dom";
import {useSelector} from "react-redux";
import {PackitDecodedToken, RootState, useAppDispatch} from "../../../types";
import {getCurrentUser} from "../../../localStorageManager";
import {saveUser} from "../../store/login/login";
import {actions} from "../../store/login/loginThunks";

export default function ProtectedRoute() {
    const navigate = useNavigate();
    const {isAuthenticated, authConfig} = useSelector((state: RootState) => state.login);
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(actions.fetchAuthConfig());
    }, []);

    useEffect(() => {
        const user = getCurrentUser();

        if (!authConfig.enableAuth) {
            return;
        }

        if (!isAuthenticated && !user?.token) {
            navigate("/login");
            return;
        }

        if (user && user.token) {
            const token = user.token;

            if (isExpired(token)) {
                navigate("/login");
            }

            const decodedToken = decodeToken(token) as PackitDecodedToken;

            const newUser = (decodedToken && decodedToken.email)
                ? {...user, email: decodedToken.email}
                : user;

            dispatch(saveUser(newUser));
        }

    }, [navigate, authConfig]);

    return (
        <Outlet/>
    );
}
