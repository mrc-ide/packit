import { useLocation } from "react-router-dom";
import appConfig, { githubAuthEndpoint } from "../../../config/appConfig";
import { buttonVariants } from "../Base/Button";
import { Github } from "lucide-react";

export const GithubAuthForm = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const githubLoginError = searchParams.get("error");

  return (
    <>
      <a href={githubAuthEndpoint(appConfig)} className={buttonVariants({ variant: "outline" })}>
        <Github className="mr-2 h-4 w-4" />
        Github
      </a>
      {githubLoginError && <div className="text-xs text-red-500">{githubLoginError}</div>}
    </>
  );
};
