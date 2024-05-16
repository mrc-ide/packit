import { UserAuthForm } from "./UserAuthForm";

export default function Login() {
  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Login to account</h1>
      </div>
      <UserAuthForm />
    </>
  );
}
