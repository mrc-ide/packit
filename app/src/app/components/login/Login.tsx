import { UserAuthForm } from "./UserAuthForm";

export default function Login() {
  return (
    <div className="container h-[800px] flex items-center justify-center m-auto">
      <div className="md:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Login to account</h1>
          </div>
          <UserAuthForm />
        </div>
      </div>
    </div>
  );
}
