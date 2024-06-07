/* eslint-disable max-len */
import {
  NewRolePermission,
  RolePermission
} from "../../../../../../app/components/contents/manageAccess/types/RoleWithRelationships";
import { isDuplicateUpdatePermission } from "../../../../../../app/components/contents/manageAccess/updatePermission/utils/isDuplicateUpdatePermission";

describe("isDuplicateUpdatePermission", () => {
  it("should return true if the updated permission is a duplicate", () => {
    const currentPermissions = [{ permission: "permission1" }, { permission: "permission2" }] as unknown as
      | NewRolePermission[]
      | RolePermission[];
    const updatedPermission = { permission: "permission1" } as unknown as NewRolePermission | RolePermission;

    const result = isDuplicateUpdatePermission(currentPermissions, updatedPermission);

    expect(result).toBe(true);
  });

  it("should return false if the updated permission is not a duplicate", () => {
    const currentPermissions = [
      { permission: "permission1" },
      { permission: "permission2" }
    ] as unknown as RolePermission[];
    const updatedPermission = { permission: "permission3" } as unknown as RolePermission;

    const result = isDuplicateUpdatePermission(currentPermissions, updatedPermission);

    expect(result).toBe(false);
  });
});
