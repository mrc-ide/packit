import { useSearchParams } from "react-router-dom";
import { UpdatePasswordForm } from "./UpdatePasswordForm";
import { useAuthConfig } from "../providers/AuthConfigProvider";

export const UpdatePassword = () => {
  const [searchParams] = useSearchParams();
  const authConfig = useAuthConfig();
  const resetPasswordError = searchParams.get("error") || "";
  const email = searchParams.get("email");

  if (!authConfig?.enableBasicLogin) {
    return (
      <div className="text-red-500">
        <p>Invalid request, password update only available for basic auth</p>
      </div>
    );
  }

  return (
    <>
      {email ? (
        <>
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Update your password</h1>
            {resetPasswordError && <div className="text-xs text-red-500">{resetPasswordError}</div>}
          </div>
          <UpdatePasswordForm email={email} />
        </>
      ) : (
        <div className="text-red-500">
          <p>Invalid request, no email found. Please try again.</p>
        </div>
      )}
    </>
  );
};
