import React, {useEffect} from "react";
import {useNavigate, Outlet} from "react-router-dom";
import {useSelector} from "react-redux";
import {RootState, useAppDispatch} from "../../../types";
import {getCurrentUser} from "../../../localStorageManager";
import {saveUser} from "../../store/login/login";

export default function ProtectedRoute() {
    const navigate = useNavigate();
    const {isAuthenticated} = useSelector((state: RootState) => state.login);
    const dispatch = useAppDispatch();

    useEffect(() => {
        const user = getCurrentUser();

        if (!isAuthenticated && user && !user.token) {
            navigate("/login");
            return;
        }

        if (user && user.token) {
            dispatch(saveUser(user));
        }

    }, [navigate, isAuthenticated]);

    return (
        <Outlet />
    );
}
