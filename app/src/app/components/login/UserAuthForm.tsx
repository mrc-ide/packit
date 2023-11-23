/* eslint-disable react/prop-types */
"use client";

import { Button, buttonVariants } from "../Base/Button";
import { cn } from "../../../lib/cn";
import { Label } from "../Base/Label";
import { Input } from "../Base/Input";
import { Github } from "lucide-react";
import { RootState, useAppDispatch } from "../../../types";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { actions } from "../../store/login/loginThunks";
import { Link, useNavigate } from "react-router-dom";
import appConfig from "../../../config/appConfig";

type UserAuthFormProps = React.HTMLAttributes<HTMLDivElement>;

export function UserAuthForm({ className, ...props }: UserAuthFormProps) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, userError, authConfig } = useSelector((state: RootState) => state.login);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated]);
  useEffect(() => {
    dispatch(actions.fetchAuthConfig());
  }, []);

  const onSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault();

    dispatch(actions.fetchToken({ email, password }));
  };

  const handleInvalid = (event: React.BaseSyntheticEvent) => {
    if (event.target.id === "email") {
      setEmailError(true);
    } else if (event.target.id === "password") {
      setPasswordError(true);
    }
  };

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      {authConfig.enableFormLogin && (
        <form onSubmit={onSubmit} onInvalid={handleInvalid}>
          <div className="grid gap-2">
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                className={`${emailError ? "border-red-500" : ""}`}
              />
            </div>
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="password">
                Password
              </Label>
              <Input
                id="password"
                placeholder="IlKrOL_z@w3+mSf^d=y$"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoCapitalize="none"
                autoComplete="password"
                autoCorrect="off"
                className={`${passwordError ? "border-red-500" : ""}`}
              />
            </div>
            <Button type="submit">Sign In with Email</Button>
          </div>
        </form>
      )}

      {authConfig?.enableGithubLogin && (
        <>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>
          <Link
            to={`${appConfig.apiUrl()}/oauth2/authorization/github`}
            className={buttonVariants({ variant: "outline" })}
          >
            <Github className="mr-2 h-4 w-4" />
            Github
          </Link>
        </>
      )}
      {userError && <div className="text-xs text-red-500">{userError.error.detail}</div>}
    </div>
  );
}
