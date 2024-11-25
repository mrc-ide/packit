import { UserAuthForm } from "./UserAuthForm";
import { useSearchParams } from "react-router-dom";

export default function Login() {
  const [searchParams] = useSearchParams();
  const sessionExpiryInfo = searchParams.get("info");
  return (
    <>
      {sessionExpiryInfo && (
        <div className="text-xs text-info justify-self-center">{sessionExpiryMsg}</div>
      )}
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Login to account</h1>
      </div>
      <UserAuthForm />
    </>
  );
}
