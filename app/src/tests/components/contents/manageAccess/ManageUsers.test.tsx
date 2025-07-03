import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import { ManageUsers } from "../../../../app/components/contents/manageAccess";
import { ManageAccessOutlet } from "../../../../app/components/contents/manageAccess/ManageAccessOutlet";
import { AuthConfigProvider } from "../../../../app/components/providers/AuthConfigProvider";
import { UserProvider } from "../../../../app/components/providers/UserProvider";
import { mockUsersWithPermissions } from "../../../mocks";

const mockAuthConfig = vitest.fn();
const mockUser = vitest.fn();
vitest.mock("../../../../lib/localStorageManager", () => ({
  getAuthConfigFromLocalStorage: () => mockAuthConfig(),
  getUserFromLocalStorage: () => mockUser()
}));
const renderComponent = () =>
  render(
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <AuthConfigProvider>
        <UserProvider>
          <MemoryRouter initialEntries={["/manage-users"]}>
            <Routes>
              <Route element={<ManageAccessOutlet />}>
                <Route path="/manage-users" element={<ManageUsers />} />
              </Route>
            </Routes>
          </MemoryRouter>
        </UserProvider>
      </AuthConfigProvider>
    </SWRConfig>
  );
describe("ManageUsers", () => {
  it("it should render users data correctly", async () => {
    mockAuthConfig.mockReturnValue({ enableBasicLogin: false });
    mockUser.mockReturnValue({ userName: mockUsersWithPermissions[0].username });
    renderComponent();

    await waitFor(() => {
      mockUsersWithPermissions.forEach((user) => {
        const userColumn = screen.getAllByText(user.username, { exact: false })[0].parentElement as HTMLElement;
        expect(userColumn).toHaveTextContent(user.username);
        expect(userColumn).toHaveTextContent(user.email ?? "No email");
        expect(userColumn).toHaveTextContent(user.displayName ?? "No display name");

        user.specificPermissions.forEach((permission) => {
          expect(screen.getAllByText(permission.permission, { exact: false })[0]).toBeVisible();
        });
      });
    });
    // x@gmail no roles,pemissions. <b,d,e>@gmail has no specific permissions
    expect(screen.getAllByText("None").length).toBe(5);
    // cant delete own user
    expect(screen.getAllByRole("button", { name: "delete-user" })[0]).toBeDisabled();
    // actions to delete and edit roles for all rows
    expect(screen.getAllByRole("button", { name: "delete-user" })).toHaveLength(mockUsersWithPermissions.length);
    expect(screen.getAllByRole("button", { name: "edit-user" })).toHaveLength(mockUsersWithPermissions.length);
  });

  it("should render add user button if basic login is enabled", async () => {
    mockAuthConfig.mockReturnValue({ enableBasicLogin: true });
    renderComponent();

    expect(screen.getByRole("button", { name: "Add user" })).toBeVisible();
  });

  it("should not render add user button if basic login is disabled", async () => {
    mockAuthConfig.mockReturnValue({ enableBasicLogin: false });
    renderComponent();

    expect(screen.queryByRole("button", { name: "Add user" })).not.toBeInTheDocument();
  });

  it("should filter users by name", async () => {
    mockAuthConfig.mockReturnValue({ enableBasicLogin: false });
    renderComponent();

    const filterInput = await screen.findByPlaceholderText(/Search by username or role/i);
    userEvent.type(filterInput, "x@gmail");

    await waitFor(() => {
      mockUsersWithPermissions.slice(0, 4).forEach((user) => {
        expect(screen.queryByText(user.username)).not.toBeInTheDocument();
      });
    });

    expect(screen.getByText(mockUsersWithPermissions[5].username)).toBeVisible();
  });

  it("should reset filter when reset button is clicked", async () => {
    mockAuthConfig.mockReturnValue({ enableBasicLogin: false });
    renderComponent();

    const filterInput = await screen.findByPlaceholderText(/Search by username or role/i);
    userEvent.type(filterInput, "x@gmail");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /reset/i })).toBeVisible();
    });

    userEvent.click(screen.getByRole("button", { name: /reset/i }));

    await waitFor(() => {
      expect(filterInput).toHaveValue("");
    });
    mockUsersWithPermissions.forEach((user) => {
      // email is same as username thus need to getall and get the first one
      expect(screen.getAllByText(user.username)[0]).toBeVisible();
    });
  });

  it("should disable delete and edit buttons for own user", async () => {
    mockAuthConfig.mockReturnValue({ enableBasicLogin: false });
    mockUser.mockReturnValue({ userName: mockUsersWithPermissions[0].username });
    renderComponent();

    expect(screen.getAllByRole("button", { name: "delete-user" })[0]).toBeDisabled();
    expect(screen.getAllByRole("button", { name: "edit-user" })[0]).toBeDisabled();
  });
});
