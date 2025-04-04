// eslint-disable-next-line max-len
import { getRolesUsersWithReadGroupPermission } from "../../../../../app/components/contents/home/utils/getRolesUsersWithReadGroupPermission";
import { RoleWithRelationships } from "../../../../../app/components/contents/manageAccess/types/RoleWithRelationships";
import { UserWithRoles } from "../../../../../app/components/contents/manageAccess/types/UserWithRoles";

const mockHasPacketReadPermissionForGroup = jest.fn();
const mockMapPermissionsToNames = jest.fn().mockReturnValue([]);
jest.mock("../../../../../lib/auth/hasPermission", () => ({
  hasPacketReadPermissionForGroup: () => mockHasPacketReadPermissionForGroup()
}));
jest.mock("../../../../../lib/constructPermissionName", () => ({
  mapPermissionsToNames: () => mockMapPermissionsToNames()
}));

describe("getRoleUsersWithReadGroupPermission", () => {
  const mockPacketGroupName = "testGroup";
  const mockRoles = [
    {
      id: "role1",
      rolePermissions: [{ permission: "read", packetGroup: { name: mockPacketGroupName } }]
    },
    {
      id: "role2",
      rolePermissions: [{ permission: "read", packetGroup: { name: "otherGroup" } }]
    }
  ] as unknown as RoleWithRelationships[];

  const mockUsers = [
    {
      id: "user1",
      specificPermissions: [{ permission: "read", packetGroup: { name: mockPacketGroupName } }]
    },
    {
      id: "user2",
      specificPermissions: [{ permission: "read", packetGroup: { name: "otherGroup" } }]
    }
  ] as unknown as UserWithRoles[];

  it("should return roles and users with read permissions for the specified packet group", () => {
    mockHasPacketReadPermissionForGroup
      .mockReturnValueOnce(true) // role 1
      .mockReturnValueOnce(false) // role 2
      .mockReturnValueOnce(true) // user 1
      .mockReturnValueOnce(false); // user 2

    const result = getRolesUsersWithReadGroupPermission(mockRoles, mockUsers, mockPacketGroupName);

    expect(mockHasPacketReadPermissionForGroup).toHaveBeenCalledTimes(4);
    expect(mockMapPermissionsToNames).toHaveBeenCalledTimes(4);
    expect(result).toEqual([mockRoles[0], mockUsers[0]]);
  });
});
