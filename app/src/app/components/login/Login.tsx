import React, {useEffect} from "react";
import {Link, Navigate} from "react-router-dom";
import appConfig from "../../../config/appConfig";
import {RootState, useAppDispatch} from "../../../types";
import {actions} from "../../store/login/loginThunks";
import {useSelector} from "react-redux";

export default function Login() {
    const dispatch = useAppDispatch();
    const {
        isAuthenticated,
        userError,
        authConfig
    } = useSelector((state: RootState) => state.login);

    useEffect(() => {
        dispatch(actions.fetchAuthConfig());
    }, []);

    return (
        <div data-testid="login" className="login-container">
            <div className="login-box">
                <h1 className="mb-4">Login</h1>
                {isAuthenticated && <Navigate to="/"/>}
                {
                    authConfig.enableGithubLogin &&
                    <div>
                        {authConfig.enableFormLogin && <div className="divider m-2">OR</div>}
                        <Link
                            to={`${appConfig.apiUrl()}/oauth2/authorization/github`}
                            className="btn">
                            Login With GitHub
                        </Link>
                    </div>
                }
                {userError && <div className="invalid-feedback d-block">{userError.error.detail}</div>}
            </div>
        </div>
    );
}
