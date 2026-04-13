import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PacketRunnerLayout } from "@components/contents/runner";
import * as UserProvider from "@components/providers/UserProvider";
import { useRunnerConfig } from "@components/providers/RunnerConfigProvider";

const mockUseUser = vitest.spyOn(UserProvider, "useUser");

vitest.mock("@components/providers/RunnerConfigProvider", () => ({
  useRunnerConfig: vitest.fn()
}));

const mockedUseRunnerConfig = vitest.mocked(useRunnerConfig);

describe("packet runner component", () => {
  const renderElement = () => {
    return render(
      <MemoryRouter initialEntries={["/runner"]}>
        <Routes>
          <Route element={<PacketRunnerLayout />}>
            <Route path="runner" element={<div>run page</div>} />
            <Route path="runner/logs" element={<div>logs page</div>} />
            <Route path="runner/logs/:taskId" element={<div>logs for a particular task</div>} />
            <Route path="runner/packages" element={<div>packages page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  it("should allow navigation between run and logs in from sidebar given packet.run permission", async () => {
    mockUseUser.mockReturnValue({ authorities: ["packet.run"] } as any);
    mockedUseRunnerConfig.mockReturnValue(true);
    renderElement();

    // ensure correct url route is loaded
    expect(screen.getByText("run page")).toBeVisible();

    userEvent.click(screen.getByRole("link", { name: "Logs" }));

    expect(screen.getByText("logs page")).toBeVisible();

    userEvent.click(screen.getByRole("link", { name: "Run" }));

    expect(screen.getByText("run page")).toBeVisible();
  });

  it("should show unauthorized when user does not have packet.run authority", () => {
    mockedUseRunnerConfig.mockReturnValue(true);
    mockUseUser.mockReturnValue({ authorities: [""] } as any);
    renderElement();

    expect(screen.getByText(/Unauthorized/)).toBeVisible();
  });

  it("should show skeleton while authorities are still loading", () => {
    mockUseUser.mockReturnValue({ isLoading: true } as any);
    mockedUseRunnerConfig.mockReturnValue(true);
    renderElement();

    expect(screen.queryByText(/Unauthorized/)).not.toBeInTheDocument();
    expect(screen.queryByTestId("sidebar")).not.toBeInTheDocument();
    expect(screen.getByText("Loading...")).toBeVisible();
  });

  it("should show unauthorized when orderly runner is not enabled", () => {
    mockUseUser.mockReturnValue({ authorities: ["packet.run"] } as any);
    mockedUseRunnerConfig.mockReturnValue(false);
    renderElement();

    expect(screen.getByText(/Unauthorized/)).toBeVisible();
  });
});
