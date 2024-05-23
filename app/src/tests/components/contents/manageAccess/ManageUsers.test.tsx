import { render, screen, waitFor } from "@testing-library/react";
import { ManageUsers } from "../../../../app/components/contents/manageAccess";
import { SWRConfig } from "swr";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ManageAccessOutlet } from "../../../../app/components/contents/manageAccess/ManageAccessOutlet";
import { AuthConfigProvider } from "../../../../app/components/providers/AuthConfigProvider";
import {
  mockNonUsernameRolesWithRelationships,
  mockUsernameRolesWithRelationships,
  mockUsersWithRoles
} from "../../../mocks";
import { getUsersWithRoles } from "../../../../app/components/contents/manageAccess/utils/getUsersWithRoles";
import userEvent from "@testing-library/user-event";

const mockAuthConfig = jest.fn();
jest.mock("../../../../lib/localStorageManager", () => ({
  getAuthConfigFromLocalStorage: () => mockAuthConfig()
}));
const renderComponent = () => {
  render(
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <AuthConfigProvider>
        <MemoryRouter initialEntries={["/manage-users"]}>
          <Routes>
            <Route element={<ManageAccessOutlet />}>
              <Route path="/manage-users" element={<ManageUsers />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthConfigProvider>
    </SWRConfig>
  );
};

describe("ManageUsers", () => {
  it("it should render users data correctly", async () => {
    mockAuthConfig.mockReturnValue({ enableBasicLogin: false });
    renderComponent();

    // only username roles are rendered
    await waitFor(() => {
      mockUsersWithRoles.forEach((user) => {
        expect(screen.getAllByText(user.username, { exact: false })[0]).toBeVisible();
        user.specificPermissions.forEach((permission) => {
          expect(screen.getAllByText(permission.permission, { exact: false })[0]).toBeVisible();
        });
      });
    });
    // x@gmail no roles,pemissions. <b,d,e>@gmail has no specific permissions
    expect(screen.getAllByText("None").length).toBe(5);
    // actions to delete and edit roles for all rows
    expect(screen.getAllByRole("button", { name: "delete-user" })).toHaveLength(mockUsersWithRoles.length);
    expect(screen.getAllByRole("button", { name: "edit-user" })).toHaveLength(mockUsersWithRoles.length);
  });

  it("should render add user button if basic login is enabled", async () => {
    mockAuthConfig.mockReturnValue({ enableBasicLogin: true });
    renderComponent();

    expect(screen.getByRole("button", { name: "Add User" })).toBeVisible();
  });

  it("should not render add user button if basic login is disabled", async () => {
    mockAuthConfig.mockReturnValue({ enableBasicLogin: false });
    renderComponent();

    expect(screen.queryByRole("button", { name: "Add User" })).not.toBeInTheDocument();
  });

  it("should filter users by name", async () => {
    mockAuthConfig.mockReturnValue({ enableBasicLogin: false });
    renderComponent();

    const filterInput = await screen.findByPlaceholderText(/filter by name/i);
    userEvent.type(filterInput, "x@gmail");

    await waitFor(() => {
      mockUsersWithRoles.slice(0, 4).forEach((user) => {
        expect(screen.queryByText(user.username)).not.toBeInTheDocument();
      });
    });

    expect(screen.getByText(mockUsersWithRoles[5].username)).toBeVisible();
  });

  it("should reset filter when reset button is clicked", async () => {
    mockAuthConfig.mockReturnValue({ enableBasicLogin: false });
    renderComponent();

    const filterInput = await screen.findByPlaceholderText(/filter by name/i);
    userEvent.type(filterInput, "x@gmail");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /reset/i })).toBeVisible();
    });

    userEvent.click(screen.getByRole("button", { name: /reset/i }));

    await waitFor(() => {
      expect(filterInput).toHaveValue("");
    });
    mockUsersWithRoles.forEach((user) => {
      expect(screen.getByText(user.username)).toBeVisible();
    });
  });
});
