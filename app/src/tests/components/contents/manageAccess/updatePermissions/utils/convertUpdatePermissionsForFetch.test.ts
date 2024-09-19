/* eslint-disable max-len */
import { BaseRolePermission } from "../../../../../../app/components/contents/manageAccess/types/Role";
import { convertUpdatePermissionsForFetch } from "../../../../../../app/components/contents/manageAccess/updatePermission/utils/convertUpdatePermissionsForFetch";

describe("convertUpdatePermissionsForFetch", () => {
  const updatePermissions = {
    addPermissions: [{ permission: "packet.read" }] as unknown as BaseRolePermission[],
    removePermissions: [{ permission: "packet.run", tag: { id: 4 } }] as unknown as BaseRolePermission[]
  };

  it("should convert permissions when both add and remove permissions are not empty", () => {
    const result = convertUpdatePermissionsForFetch(updatePermissions);
    expect(result.addPermissions[0]).toEqual({ permission: "packet.read" });
    expect(result.removePermissions[0]).toEqual({ permission: "packet.run", tagId: 4 });
  });

  it("should convert permissions when both add and remove permissions are empty", () => {
    updatePermissions.addPermissions = [];
    updatePermissions.removePermissions = [];
    const result = convertUpdatePermissionsForFetch(updatePermissions);
    expect(result.addPermissions).toEqual([]);
    expect(result.removePermissions).toEqual([]);
  });
});
