import { UserAuthForm } from "./UserAuthForm";
import { useSearchParams } from "react-router-dom";

export const Login = () => {
  const [searchParams] = useSearchParams();
  const sessionExpiryInfo = searchParams.get("info");
  return (
    <>
      {sessionExpiryInfo && <div className="text-xs text-info justify-self-center">{sessionExpiryInfo}</div>}
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Log in to account</h1>
      </div>
      <UserAuthForm />
    </>
  );
};
