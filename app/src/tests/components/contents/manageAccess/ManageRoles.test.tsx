import { render, screen, waitFor } from "@testing-library/react";
import { ManageRoles } from "../../../../app/components/contents/manageAccess";
import { mockNonUsernameRolesWithRelationships } from "../../../mocks";
import { AuthConfigProvider } from "../../../../app/components/providers/AuthConfigProvider";
import { server } from "../../../../msw/server";
import { rest } from "msw";
import { manageRolesIndexUri } from "../../../../msw/handlers/manageRolesHandlers";
import { SWRConfig } from "swr";
import userEvent from "@testing-library/user-event";

const mockGetAuthConfigFromLocalStorage = jest.fn();
jest.mock("../../../../lib/localStorageManager", () => ({
  getAuthConfigFromLocalStorage: () => mockGetAuthConfigFromLocalStorage()
}));

const renderComponent = () => {
  render(
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <AuthConfigProvider>
        <ManageRoles />
      </AuthConfigProvider>
    </SWRConfig>
  );
};
describe("ManageRoles", () => {
  it("should render table data correctly", async () => {
    mockGetAuthConfigFromLocalStorage.mockReturnValueOnce({ enableBasicLogin: false });
    renderComponent();

    await waitFor(() => {
      mockNonUsernameRolesWithRelationships.forEach((role) => {
        expect(screen.getAllByText(role.name, { exact: false })[0]).toBeVisible();
        role.rolePermissions.forEach((permission) => {
          expect(screen.getAllByText(permission.permission, { exact: false })[0]).toBeVisible();
        });
      });
    });
    // last role (Viewer) has no users or permissions
    expect(screen.getAllByText("None").length).toBe(2);
    // actions to delete and edit roles for all rows
    expect(screen.getAllByRole("button", { name: "delete-role" })).toHaveLength(
      mockNonUsernameRolesWithRelationships.length
    );
    expect(screen.getAllByRole("button", { name: "edit-role" })).toHaveLength(
      mockNonUsernameRolesWithRelationships.length
    );
  });

  it("should display add role button when enableBasicLogin is true", async () => {
    mockGetAuthConfigFromLocalStorage.mockReturnValueOnce({ enableBasicLogin: true });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Add Role" })).toBeVisible();
    });
  });

  it("should not display add role button when enableBasicLogin is false", async () => {
    mockGetAuthConfigFromLocalStorage.mockReturnValueOnce({ enableBasicLogin: false });
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText("Add Role")).not.toBeInTheDocument();
    });
  });

  it("should filter roles by name", async () => {
    mockGetAuthConfigFromLocalStorage.mockReturnValueOnce({ enableBasicLogin: false });
    renderComponent();

    const filterInput = await screen.findByPlaceholderText(/filter by name/i);
    userEvent.type(filterInput, "adm");

    await waitFor(() => {
      expect(screen.queryByText(mockNonUsernameRolesWithRelationships[1].name)).not.toBeInTheDocument();
    });

    expect(screen.getByText(mockNonUsernameRolesWithRelationships[0].name)).toBeVisible();
    expect(screen.queryByText(mockNonUsernameRolesWithRelationships[2].name)).not.toBeInTheDocument();
  });

  it("should reset filter when reset button is clicked", async () => {
    mockGetAuthConfigFromLocalStorage.mockReturnValueOnce({ enableBasicLogin: false });
    renderComponent();

    const filterInput = await screen.findByPlaceholderText(/filter by name/i);
    userEvent.type(filterInput, "adm");

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /reset/i })).toBeVisible();
    });

    userEvent.click(screen.getByRole("button", { name: /reset/i }));

    await waitFor(() => {
      expect(filterInput).toHaveValue("");
    });
    mockNonUsernameRolesWithRelationships.forEach((role) => {
      expect(screen.getByText(role.name)).toBeVisible();
    });
  });
  it("should show error component if error fetching roles", async () => {
    mockGetAuthConfigFromLocalStorage.mockReturnValueOnce({ enableBasicLogin: true });
    server.use(
      rest.get(manageRolesIndexUri, (req, res, ctx) => {
        return res(ctx.status(400));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/error fetching roles/i)).toBeVisible();
    });
  });
});
