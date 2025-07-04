/* eslint-disable max-len */
import { BaseRolePermission } from "@components/contents/admin/types/RoleWithRelationships";
import { isDuplicateUpdatePermission } from "@components/contents/admin/updatePermission/utils/isDuplicateUpdatePermission";

describe("isDuplicateUpdatePermission", () => {
  it("should return true if the updated permission is a duplicate", () => {
    const currentPermissions = [
      { permission: "permission1" },
      { permission: "permission2" }
    ] as unknown as BaseRolePermission[];
    const updatedPermission = { permission: "permission1" } as unknown as BaseRolePermission;

    const result = isDuplicateUpdatePermission(currentPermissions, updatedPermission);

    expect(result).toBe(true);
  });

  it("should return false if the updated permission is not a duplicate", () => {
    const currentPermissions = [
      { permission: "permission1" },
      { permission: "permission2" }
    ] as unknown as BaseRolePermission[];
    const updatedPermission = { permission: "permission3" } as unknown as BaseRolePermission;

    const result = isDuplicateUpdatePermission(currentPermissions, updatedPermission);

    expect(result).toBe(false);
  });
});
