/* eslint-disable max-len */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BaseRolePermission } from "@components/contents/admin/types/RoleWithRelationships";
import { UpdatePermissionScrollArea } from "@components/contents/admin/updatePermission/UpdatePermissionScrollArea";
import { constructPermissionName } from "@lib/constructPermissionName";

const mockIsPermissionEqual = vitest.fn();
vitest.mock("@components/contents/manageAccess/utils/isPermissionEqual", () => ({
  isPermissionEqual: () => mockIsPermissionEqual()
}));
describe("UpdatePermissionScrollArea", () => {
  beforeEach(() => {
    vitest.clearAllMocks();
  });

  const updatePermissions: BaseRolePermission[] = [
    { permission: "permission1" },
    { permission: "permission2", packet: { name: "packet1", id: "420" } },
    { permission: "permission3", packetGroup: { name: "packetGroup1", id: 1 } },
    { permission: "permission4", tag: { name: "tag1", id: 2 } }
  ];
  const displayPermissions = updatePermissions.map((permission) => constructPermissionName(permission));
  it("should render role permission names correctly", () => {
    render(
      <UpdatePermissionScrollArea
        updatePermissions={updatePermissions}
        updateFieldName="addPermissions"
        setUpdatePermissions={vitest.fn()}
      />
    );

    displayPermissions.forEach((permission) => {
      expect(screen.getByText(permission as string)).toBeVisible();
    });
  });

  it("should call setUpdatePermissions with updated permissions when X click", () => {
    const setUpdatePermissions = vitest.fn().mockImplementation((callback) => {
      const prevUpdatePermissions = {
        addPermissions: updatePermissions,
        removePermissions: []
      };
      return callback(prevUpdatePermissions);
    });

    render(
      <UpdatePermissionScrollArea
        updatePermissions={updatePermissions}
        updateFieldName="addPermissions"
        setUpdatePermissions={setUpdatePermissions}
      />
    );

    userEvent.click(screen.getAllByRole("button")[0]);

    expect(setUpdatePermissions).toHaveBeenCalledWith(expect.any(Function));
    expect(mockIsPermissionEqual).toHaveBeenCalledTimes(updatePermissions.length);
  });

  it("should not call isPermissionEqual on X click when field is different", () => {
    const setUpdatePermissions = vitest.fn().mockImplementation((callback) => {
      const prevUpdatePermissions = {
        addPermissions: updatePermissions,
        removePermissions: []
      };
      return callback(prevUpdatePermissions);
    });

    render(
      <UpdatePermissionScrollArea
        updatePermissions={updatePermissions}
        updateFieldName="removePermissions"
        setUpdatePermissions={setUpdatePermissions}
      />
    );

    userEvent.click(screen.getAllByRole("button")[0]);

    expect(setUpdatePermissions).toHaveBeenCalledWith(expect.any(Function));
    expect(mockIsPermissionEqual).not.toHaveBeenCalled();
  });
});
