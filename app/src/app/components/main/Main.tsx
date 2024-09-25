import { Outlet } from "react-router-dom";

export default function Main() {
  return (
    <main data-testid="main">
      <div data-testid="content">
        <Outlet />
      </div>
    </main>
  );
}
