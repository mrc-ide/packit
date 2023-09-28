import React from "react";
import {useEffect} from "react";
import {RootState, useAppDispatch} from "../../../types";
import {Navigate, useLocation} from "react-router-dom";
import {saveUser} from "../../store/login/login";
import {useSelector} from "react-redux";

export default function Redirect() {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get("token");
    const {isAuthenticated} = useSelector((state: RootState) => state.login);

    useEffect(() => {
        if (token) {
            dispatch(saveUser({token: token}));
        }
    }, [token]);

    if (!isAuthenticated) {
        return (<div><p>Redirecting...</p></div>);
    }
    return (
        <div>
            <p>Redirecting user</p>
            {<Navigate to="/"/>}
        </div>
    );
}
