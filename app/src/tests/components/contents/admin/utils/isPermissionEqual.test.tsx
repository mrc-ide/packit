import { BaseRolePermission } from "@components/contents/admin/types/RoleWithRelationships";
import { isPermissionEqual } from "@components/contents/admin/utils/isPermissionEqual";

describe("isPermissionEqual", () => {
  const permission1 = {
    permission: "packet.read",
    packet: { id: "1" },
    tag: { id: "1" },
    packetGroup: { id: "1" }
  } as unknown as BaseRolePermission;

  const permission2 = {
    permission: "packet.read",
    packet: { id: "1" },
    tag: { id: "1" },
    packetGroup: { id: "1" }
  } as unknown as BaseRolePermission;

  test("returns true when both permissions are exactly the same", () => {
    expect(isPermissionEqual(permission1, permission2)).toBe(true);
  });

  test("returns false when the permissions are different", () => {
    const permission3 = { ...permission2, permission: "packet.run" };
    expect(isPermissionEqual(permission1, permission3)).toBe(false);
  });

  test("returns false when the packet ids are different", () => {
    const permission3 = { ...permission2, packet: { id: "2" } } as unknown as BaseRolePermission;
    expect(isPermissionEqual(permission1, permission3)).toBe(false);
  });

  test("returns false when the tag ids are different", () => {
    const permission3 = { ...permission2, tag: { id: "2" } } as unknown as BaseRolePermission;
    expect(isPermissionEqual(permission1, permission3)).toBe(false);
  });

  test("returns false when the packetGroup ids are different", () => {
    const permission3 = { ...permission2, packetGroup: { id: "2" } } as unknown as BaseRolePermission;
    expect(isPermissionEqual(permission1, permission3)).toBe(false);
  });
});
