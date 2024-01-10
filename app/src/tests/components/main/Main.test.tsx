import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Main } from "../../../app/components/main";
import { UserProvider } from "../../../app/components/providers/UserProvider";
import {RedirectOnLoginProvider} from "../../../app/components/providers/RedirectOnLoginProvider";

describe("main component", () => {
  const renderElement = () => {
    return render(
      <MemoryRouter>
        <UserProvider>
          <RedirectOnLoginProvider>
            <Main />
          </RedirectOnLoginProvider>
        </UserProvider>
      </MemoryRouter>
    );
  };

  it("renders active content", async () => {
    renderElement();
    const content = screen.getByTestId("content");

    await waitFor(() => {
      expect(content).toBeInTheDocument();
    });
  });

  it("renders packet root page", async () => {
    renderElement();

    await waitFor(() => {
      expect(screen.queryByTestId("packet-runner")).toBeNull();
    });
    expect(screen.queryByTestId("workflow-runner")).toBeNull();
    expect(screen.queryByTestId("project-documentation")).toBeNull();
  });
});
