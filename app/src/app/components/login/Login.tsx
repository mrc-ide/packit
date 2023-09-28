import React, {useEffect, useState} from "react";
import {Link, Navigate} from "react-router-dom";
import appConfig from "../../../config/appConfig";
import {RootState, useAppDispatch} from "../../../types";
import {actions} from "../../store/login/loginThunks";
import {useSelector} from "react-redux";

export default function Login() {
    const dispatch = useAppDispatch();
    const {
        isAuthenticated,
        tokenError,
        authConfig
    } = useSelector((state: RootState) => state.login);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        dispatch(actions.fetchAuthConfig());
    }, []);

    const handleLogin = () => {
        setEmailError("");
        setPasswordError("");

        if (!email) {
            setEmailError("Email is required");
            return;
        } else if (!isValidEmail(email)) {
            setEmailError("Invalid email format");
            return;
        }

        if (!password) {
            setPasswordError("Password is required");
            return;
        }

        dispatch(actions.fetchToken({email, password}));
    };

    const isValidEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    return (
        <div data-testid="login" className="login-container">
            <div className="login-box">
                <h1 className="mb-4">Login</h1>
                {authConfig.enableFormLogin && <div>
                    <div className="mb-3 text-start">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            className={`form-control ${emailError ? "is-invalid" : ""}`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            id="email"
                        />
                        {emailError && <div className="invalid-feedback">{emailError}</div>}
                    </div>
                    <div className="mb-3 text-start">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            className={`form-control ${passwordError ? "is-invalid" : ""}`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            id="password"
                        />
                        {passwordError && <div className="invalid-feedback">{passwordError}</div>}
                    </div>
                    <button className="btn" onClick={handleLogin}>
                        Login
                    </button>
                </div>
                }
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
                {tokenError && <div className="invalid-feedback">{tokenError.error.detail}</div>}
            </div>
        </div>
    );
}
