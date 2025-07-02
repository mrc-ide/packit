import { render, screen, waitFor } from "@testing-library/react";
// eslint-disable-next-line max-len
import { RemovePermissionsForUpdate } from "../../../../../app/components/contents/manageAccess/updatePermission/RemovePermissionsForUpdate";
import { mockNonUsernameRolesWithRelationships } from "../../../../mocks";
import userEvent from "@testing-library/user-event";
import { constructPermissionName } from "../../../../../lib/constructPermissionName";

describe("RemovePermissionsForUpdate", () => {
  it("should show rolePermission names in dropdown", async () => {
    render(
      <RemovePermissionsForUpdate
        rolePermissions={mockNonUsernameRolesWithRelationships[0].rolePermissions}
        removedPermissions={[]}
        removePermission={vitest.fn()}
      />
    );

    userEvent.click(screen.getByRole("combobox"));

    await waitFor(() => {
      mockNonUsernameRolesWithRelationships[0].rolePermissions.forEach((rolePermission) => {
        const permissionName = constructPermissionName(rolePermission);
        expect(screen.getByText(permissionName)).toBeVisible();
      });
    });
  });

  it("should call removePermission and close popover", async () => {
    const removePermission = vitest.fn();
    render(
      <RemovePermissionsForUpdate
        rolePermissions={mockNonUsernameRolesWithRelationships[0].rolePermissions}
        removedPermissions={[]}
        removePermission={removePermission}
      />
    );

    userEvent.click(screen.getByRole("combobox"));
    const firstPermission = await screen.findByText(
      constructPermissionName(mockNonUsernameRolesWithRelationships[0].rolePermissions[0])
    );
    userEvent.click(firstPermission);

    expect(removePermission).toHaveBeenCalledWith(mockNonUsernameRolesWithRelationships[0].rolePermissions[0]);

    expect(firstPermission).not.toBeInTheDocument();
  });

  it("should disable permissions that are already removed", async () => {
    const removedPermissions = [mockNonUsernameRolesWithRelationships[0].rolePermissions[0]];
    render(
      <RemovePermissionsForUpdate
        rolePermissions={mockNonUsernameRolesWithRelationships[0].rolePermissions}
        removedPermissions={removedPermissions}
        removePermission={vitest.fn()}
      />
    );

    userEvent.click(screen.getByRole("combobox"));

    await waitFor(() => {
      mockNonUsernameRolesWithRelationships[0].rolePermissions.forEach((rolePermission) => {
        const permissionName = constructPermissionName(rolePermission);
        const permission = screen.getByText(permissionName);
        if (removedPermissions.includes(rolePermission)) {
          expect(permission).toHaveAttribute("data-disabled", "true");
        } else {
          expect(permission).toHaveAttribute("data-disabled", "false");
        }
      });
    });
  });
});
