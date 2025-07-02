import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { PacketRunnerLayout } from "../../../../app/components/contents/runner";
import * as UserProvider from "../../../../app/components/providers/UserProvider";

const mockUseUser = vitest.spyOn(UserProvider, "useUser");
describe("packet runner component", () => {
  const renderElement = () => {
    return render(
      <MemoryRouter initialEntries={["/runner"]}>
        <Routes>
          <Route element={<PacketRunnerLayout />}>
            <Route path="runner" element={<div>run page</div>} />
            <Route path="runner/logs" element={<div>logs page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  };

  it("should allow navigation between run and logs in from sidebar given packet.run permission", async () => {
    mockUseUser.mockReturnValue({ authorities: ["packet.run"] } as any);
    renderElement();

    // ensure correct url route is loaded
    expect(screen.getByText("run page")).toBeVisible();

    userEvent.click(screen.getByRole("link", { name: "Logs" }));

    expect(screen.getByText("logs page")).toBeVisible();

    userEvent.click(screen.getByRole("link", { name: "Run" }));

    expect(screen.getByText("run page")).toBeVisible();
  });

  it("should show unauthorized when user does not have packet.run authority", () => {
    mockUseUser.mockReturnValue({ authorities: [""] } as any);
    renderElement();

    expect(screen.getByText(/Unauthorized/)).toBeVisible();
  });
});
