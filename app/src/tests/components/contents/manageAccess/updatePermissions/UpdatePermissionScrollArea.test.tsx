/* eslint-disable max-len */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BaseRolePermission } from "../../../../../app/components/contents/manageAccess/types/RoleWithRelationships";
import { UpdatePermissionScrollArea } from "../../../../../app/components/contents/manageAccess/updatePermission/UpdatePermissionScrollArea";
import { constructPermissionName } from "../../../../../lib/constructPermissionName";

const mockIsPermissionEqual = jest.fn();
jest.mock("../../../../../app/components/contents/manageAccess/utils/isPermissionEqual", () => ({
  isPermissionEqual: () => mockIsPermissionEqual()
}));
describe("UpdatePermissionScrollArea", () => {
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
        setUpdatePermissions={jest.fn()}
      />
    );

    displayPermissions.forEach((permission) => {
      expect(screen.getByText(permission as string)).toBeVisible();
    });
  });

  it("should call setUpdatePermissions with updated permissions when X click", () => {
    const setUpdatePermissions = jest.fn().mockImplementation((callback) => {
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

  it("should not call isPermissionEqual on X click when field is diffrerent", () => {
    const setUpdatePermissions = jest.fn().mockImplementation((callback) => {
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
