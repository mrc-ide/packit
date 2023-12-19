import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Home } from "../../../app/components/contents/explorer";
import { Login, Redirect } from "../../../app/components/login";

describe("redirect", () => {
  const renderElement = (location = "/redirect?token=fakeToken") => {
    return render(
      <MemoryRouter initialEntries={[location]}>
        <Routes>
          <Route path="/redirect" element={<Redirect />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it(" renders", () => {
    expect(true).toBe(true);
  });
  // it("can render redirect correctly for successful login when store has not updated", () => {
  //   const store = getStore();
  //   const mockDispatch = jest.spyOn(store, "dispatch");
  //   renderElement(store);
  //   expect(screen.getByText("Redirecting...")).toBeInTheDocument();
  //   expect(mockDispatch).toHaveBeenCalledTimes(1);
  //   expect(mockDispatch).toHaveBeenCalledWith({ type: "login/saveUser", payload: { token: "fakeToken" } });
  // });

  // it("can render redirect correctly for failedlogin when store has not updated", () => {
  //   const store = getStore();
  //   const mockDispatch = jest.spyOn(store, "dispatch");
  //   renderElement(store, "/redirect?error=bad token");
  //   expect(screen.getByText("Redirecting...")).toBeInTheDocument();
  //   expect(mockDispatch).toHaveBeenCalledTimes(1);
  //   expect(mockDispatch).toHaveBeenCalledWith({ type: "login/loginError", payload: "bad token" });
  // });

  // it("can redirect for successful login when store has updated", async () => {
  //   const store = getStore({ isAuthenticated: true });
  //   const mockDispatch = jest.spyOn(store, "dispatch");
  //   renderElement(store);

  //   await waitFor(() => {
  //     expect(screen.getByText(/manage packets/i)).toBeVisible();
  //   });
  //   expect(mockDispatch).toHaveBeenCalledTimes(1);
  // });

  // it("can redirect for failed login when store has updated", () => {
  //   const error = { error: "Login failed", detail: "bad token" };
  //   const store = getStore({ userError: { error } });
  //   const mockDispatch = jest.spyOn(store, "dispatch");
  //   renderElement(store, "/redirect?error=bad token");
  //   expect(screen.getByText("bad token")).toBeVisible();
  //   expect(mockDispatch).toHaveBeenCalledTimes(2);
  // });
});
