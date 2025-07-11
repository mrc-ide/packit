/* eslint-disable react/prop-types */
"use client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@lib/cn";
import { isAuthenticated } from "@lib/isAuthenticated";
import { useAuthConfig } from "../providers/AuthConfigProvider";
import { useRedirectOnLogin } from "../providers/RedirectOnLoginProvider";
import { useUser } from "../providers/UserProvider";
import { BasicUserAuthForm } from "./BasicUserAuthForm";
import { GithubAuthForm } from "./GithubAuthForm";
import { windowNavigate } from "@lib/navigate";

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export const UserAuthForm = ({ className, ...props }: UserAuthFormProps) => {
  const navigate = useNavigate();
  const authConfig = useAuthConfig();
  const { user } = useUser();
  const { loggingOut, setLoggingOut } = useRedirectOnLogin();
  const loginRoute = `${import.meta.env.BASE_URL}login`;
  useEffect(() => {
    if (loggingOut) {
      setLoggingOut(false);
    }
    if (isAuthenticated(authConfig, user)) {
      navigate("/");
    } else {
      if (authConfig?.enablePreAuthLogin) {
        // Redirect to external login
        windowNavigate(loginRoute);
      }
    }
  }, []);

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {authConfig?.enableBasicLogin && <BasicUserAuthForm />}
      {authConfig?.enableGithubLogin && <GithubAuthForm />}
      {authConfig?.enablePreAuthLogin && (
        <p>
          Login with external provider. Click <a href={loginRoute}>here</a> if you are not redirected automatically.
        </p>
      )}
    </div>
  );
};
