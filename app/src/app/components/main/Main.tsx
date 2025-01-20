import { Outlet } from "react-router-dom";

export const Main = () => {
  return (
    <main data-testid="main">
      <div data-testid="content">
        <Outlet />
      </div>
    </main>
  );
};
