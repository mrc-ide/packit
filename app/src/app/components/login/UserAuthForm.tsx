/* eslint-disable react/prop-types */
"use client";

import { Github } from "lucide-react";
import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import appConfig from "../../../config/appConfig";
import { cn } from "../../../lib/cn";
import { buttonVariants } from "../Base/Button";
import { useAuthConfig } from "../providers/AuthConfigProvider";
import { useUser } from "../providers/UserProvider";
import { useRedirectOnLogin } from "../providers/RedirectOnLoginProvider";

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const navigate = useNavigate();
  const authConfig = useAuthConfig();
  const { user } = useUser();
  const { loggingOut, setLoggingOut } = useRedirectOnLogin();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const loginError = searchParams.get("error");

  useEffect(() => {
    if (loggingOut) {
      setLoggingOut(false);
    }

    if (user?.token) {
      navigate("/");
    }
  }, [user?.token]);

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {authConfig?.enableGithubLogin && (
        <>
          <Link
            to={`${appConfig.apiUrl()}/oauth2/authorization/github?redirect_uri=testred`}
            className={buttonVariants({ variant: "outline" })}
          >
            <Github className="mr-2 h-4 w-4" />
            Github
          </Link>
        </>
      )}
      {loginError && <div className="text-xs text-red-500">{loginError}</div>}
    </div>
  );
}
