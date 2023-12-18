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

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const navigate = useNavigate();
  const authConfig = useAuthConfig();
  const { user } = useUser();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const error = searchParams.get("error");

  useEffect(() => {
    if (user?.token) {
      navigate("/");
    }
  }, [user]);

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {authConfig?.enableGithubLogin && (
        <>
          <Link
            to={`${appConfig.apiUrl()}/oauth2/authorization/github`}
            className={buttonVariants({ variant: "outline" })}
          >
            <Github className="mr-2 h-4 w-4" />
            Github
          </Link>
        </>
      )}
      {/* TODO get from search params  */}
      {error && <div className="text-xs text-red-500">{error}</div>}
    </div>
  );
}
