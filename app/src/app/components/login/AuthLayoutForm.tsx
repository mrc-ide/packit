import { Outlet } from "react-router-dom";

export const AuthLayoutForm = () => {
  return (
    <div className="container h-[800px] flex items-center justify-center m-auto">
      <div className="md:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
