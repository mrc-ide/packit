import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Login } from "../../../app/components/login";

describe("login", () => {
  const renderElement = () => {
    return render(
      <MemoryRouter initialEntries={["/login"]}>
        <Login />
      </MemoryRouter>
    );
  };

  it("can render github login", () => {
    renderElement();
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });

  it("can render token error", () => {
    renderElement();

    expect(screen.getByText(/ERROR DETAIL/)).toBeInTheDocument();
  });

  // it("can navigate to github login", () => {
  //   const store = getStore({
  //     authConfig: {
  //       enableFormLogin: true,
  //       enableGithubLogin: true
  //     }
  //   });

  //   const mockDispatch = jest.spyOn(store, "dispatch");

  //   renderElement(store);

  //   expect(mockDispatch).toHaveBeenCalledTimes(1);

  //   const githubLogin = screen.getByRole("link", { name: /github/i });

  //   userEvent.click(githubLogin);

  //   expect(mockDispatch).toHaveBeenCalledTimes(1);
  // });
});
