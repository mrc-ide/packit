/* eslint-disable react/prop-types */
"use client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/cn";
import { isAuthenticated } from "../../../lib/isAuthenticated";
import { useAuthConfig } from "../providers/AuthConfigProvider";
import { useRedirectOnLogin } from "../providers/RedirectOnLoginProvider";
import { useUser } from "../providers/UserProvider";
import { BasicUserAuthForm } from "./BasicUserAuthForm";
import { GithubAuthForm } from "./GithubAuthForm";

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export const UserAuthForm = ({ className, ...props }: UserAuthFormProps) => {
  const navigate = useNavigate();
  const authConfig = useAuthConfig();
  const { user } = useUser();
  const { loggingOut, setLoggingOut } = useRedirectOnLogin();

  useEffect(() => {
    if (loggingOut) {
      setLoggingOut(false);
    }
    if (isAuthenticated(authConfig, user)) {
      navigate("/");
    }
  }, [user?.token]);

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {authConfig?.enableBasicLogin && <BasicUserAuthForm />}
      {authConfig?.enableGithubLogin && <GithubAuthForm />}
    </div>
  );
};
