import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ManageAccessLayout } from "../../../../app/components/contents/manageAccess";
import userEvent from "@testing-library/user-event";
import { UserProvider } from "../../../../app/components/providers/UserProvider";
import { UserState } from "../../../../app/components/providers/types/UserTypes";
import { mockUserState } from "../../../mocks";

const mockGetUserFromLocalStorage = jest.fn((): null | UserState => null);
jest.mock("../../../../lib/localStorageManager", () => ({
  getUserFromLocalStorage: () => mockGetUserFromLocalStorage()
}));

describe("ManageAccessLayout", () => {
  it("should allow navigation between sidebar and render outlet when user access", async () => {
    mockGetUserFromLocalStorage.mockReturnValue(mockUserState);
    render(
      <UserProvider>
        <MemoryRouter initialEntries={["/manage-roles"]}>
          <Routes>
            <Route element={<ManageAccessLayout />}>
              <Route path="manage-roles" element={<div>role management</div>} />
              <Route path="manage-users" element={<div>user management</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </UserProvider>
    );

    expect(screen.getByText("role management")).toBeVisible();

    userEvent.click(screen.getByRole("link", { name: "Manage Users" }));

    expect(screen.getByText("user management")).toBeVisible();
  });

  it("should show unauthorized when user does not have user.manage authority", () => {
    mockGetUserFromLocalStorage.mockReturnValue({ ...mockUserState, authorities: [] });
    render(
      <UserProvider>
        <MemoryRouter initialEntries={["/manage-roles"]}>
          <Routes>
            <Route element={<ManageAccessLayout />}>
              <Route path="manage-roles" element={<div>role management</div>} />
              <Route path="manage-users" element={<div>user management</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </UserProvider>
    );

    expect(screen.getByText(/Unauthorized/)).toBeVisible();
  });
});
