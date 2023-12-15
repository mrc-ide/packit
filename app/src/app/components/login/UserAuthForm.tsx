/* eslint-disable react/prop-types */
"use client";

import { Github } from "lucide-react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import appConfig from "../../../config/appConfig";
import { cn } from "../../../lib/cn";
import { RootState, useAppDispatch } from "../../../types";
import { actions } from "../../store/login/loginThunks";
import { buttonVariants } from "../Base/Button";

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, userError, authConfig } = useSelector((state: RootState) => state.login);
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(actions.fetchAuthConfig());
  }, []);
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated]);

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
      {userError && <div className="text-xs text-red-500">{userError?.error?.detail}</div>}
    </div>
  );
}
