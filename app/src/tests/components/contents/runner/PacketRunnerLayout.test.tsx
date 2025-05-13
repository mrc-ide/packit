import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PacketRunnerLayout } from "../../../../app/components/contents/runner";
import { UserProvider } from "../../../../app/components/providers/UserProvider";
import userEvent from "@testing-library/user-event";
import { UserState } from "../../../../app/components/providers/types/UserTypes";

const mockGetUserFromLocalStorage = jest.fn((): null | UserState => null);
jest.mock("../../../../lib/localStorageManager", () => ({
  getUserFromLocalStorage: () => mockGetUserFromLocalStorage(),
  getAuthConfigFromLocalStorage: jest.fn().mockReturnValue({ authEnabled: true, enableGithubLogin: true })
}));
describe("packet runner component", () => {
  const renderElement = () => {
    return render(
      <UserProvider>
        <MemoryRouter initialEntries={["/runner"]}>
          <Routes>
            <Route element={<PacketRunnerLayout />}>
              <Route path="runner" element={<div>run page</div>} />
              <Route path="runner/logs" element={<div>logs page</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </UserProvider>
    );
  };

  it("should allow navigation between run and logs in from sidebar given packet.run permission", async () => {
    // mockGetUserFromLocalStorage.mockReturnValue({ authorities: ["packet.run"] } as UserState);
    renderElement();

    // ensure correct url route is loaded
    expect(screen.getByText("run page")).toBeVisible();

    userEvent.click(screen.getByRole("link", { name: "Logs" }));

    expect(screen.getByText("logs page")).toBeVisible();

    userEvent.click(screen.getByRole("link", { name: "Run" }));

    expect(screen.getByText("run page")).toBeVisible();
  });

  it("should show unauthorized when user does not have packet.run authority", () => {
    // mockGetUserFromLocalStorage.mockReturnValue({ authorities: [""] } as UserState);
    renderElement();

    expect(screen.getByText(/Unauthorized/)).toBeVisible();
  });
});
