import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import { ManageRoles } from "@components/contents/manageAccess";
import { ManageAccessOutlet } from "@components/contents/manageAccess/ManageAccessOutlet";
import { server } from "@/msw/server";
import { mockNonUsernameRolesWithRelationships } from "@/tests/mocks";
import { usersRolesIndexUri } from "@/msw/handlers/usersRolesHandler";

const renderComponent = () => {
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter initialEntries={["/manage-roles"]}>
        <Routes>
          <Route element={<ManageAccessOutlet />}>
            <Route path="/manage-roles" element={<ManageRoles />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </SWRConfig>
  );
};
describe("ManageRoles", () => {
  it("should render table data correctly", async () => {
    renderComponent();

    // only non-username roles are rendered
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
    // cant delete or edit admin role
    expect(screen.getAllByRole("button", { name: "delete-role" })[0]).toBeDisabled();
    expect(screen.getAllByRole("button", { name: "edit-role" })[0]).toBeDisabled();
  });

  it("should search by role or user", async () => {
    renderComponent();

    const filterInput = await screen.findByPlaceholderText(/search by role or user/i);
    userEvent.type(filterInput, "adm");

    await waitFor(() => {
      expect(screen.queryByText(mockNonUsernameRolesWithRelationships[1].name)).not.toBeInTheDocument();
    });

    expect(screen.getByText(mockNonUsernameRolesWithRelationships[0].name)).toBeVisible();
    expect(screen.queryByText(mockNonUsernameRolesWithRelationships[2].name)).not.toBeInTheDocument();
  });

  it("should reset filter when reset button is clicked", async () => {
    renderComponent();

    const filterInput = await screen.findByPlaceholderText(/search by role or user/i);
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
    server.use(
      rest.get(usersRolesIndexUri, (req, res, ctx) => {
        return res(ctx.status(400));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/error fetching data/i)).toBeVisible();
    });
  });

  it("should disable delete and edit buttons for admin role", async () => {
    renderComponent();

    const deleteButtons = await screen.findAllByRole("button", { name: "delete-role" });
    const editButtons = await screen.findAllByRole("button", { name: "edit-role" });
    expect(deleteButtons[0]).toBeDisabled();
    expect(editButtons[0]).toBeDisabled();
  });
});
