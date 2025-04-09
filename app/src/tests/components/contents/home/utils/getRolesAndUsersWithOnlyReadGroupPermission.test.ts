// eslint-disable-next-line max-len
import { getRolesAndUsersWithOnlyReadGroupPermission } from "../../../../../app/components/contents/home/utils/getRolesAndUsersWithOnlyReadGroupPermission";
import { RoleWithRelationships } from "../../../../../app/components/contents/manageAccess/types/RoleWithRelationships";
import { UserWithRoles } from "../../../../../app/components/contents/manageAccess/types/UserWithRoles";

const mockHasPacketReadPermissionForGroup = jest.fn().mockReturnValue(false);
const mockCanReadAllPackets = jest.fn().mockReturnValue(false);
const mockCanManagePacketGroup = jest.fn().mockReturnValue(false);
const mockMapPermissionsToNames = jest.fn().mockReturnValue([]);
jest.mock("../../../../../lib/auth/hasPermission", () => ({
  hasPacketReadPermissionForGroup: () => mockHasPacketReadPermissionForGroup(),
  canReadAllPackets: () => mockCanReadAllPackets(),
  canManagePacketGroup: () => mockCanManagePacketGroup()
}));
jest.mock("../../../../../lib/constructPermissionName", () => ({
  mapPermissionsToNames: () => mockMapPermissionsToNames()
}));

describe("getRolesAndUsersWithOnlyReadGroupPermission", () => {
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
    for (let i = 0; i < mockRoles.length + mockUsers.length; i++) {
      // role 1, user 1
      if (i % 2 == 0) {
        mockHasPacketReadPermissionForGroup.mockReturnValueOnce(true);
      } else {
        // role 2, user 2
        mockHasPacketReadPermissionForGroup.mockReturnValueOnce(false);
      }
    }

    const result = getRolesAndUsersWithOnlyReadGroupPermission(mockRoles, mockUsers, mockPacketGroupName);

    expect(mockHasPacketReadPermissionForGroup).toHaveBeenCalledTimes(4);
    expect(mockMapPermissionsToNames).toHaveBeenCalledTimes(4);
    expect(mockCanReadAllPackets).toHaveBeenCalledTimes(2);
    expect(mockCanManagePacketGroup).toHaveBeenCalledTimes(2);
    expect(result).toEqual([mockRoles[0], mockUsers[0]]);
  });

  it("should not return roles and users with with global read permissions", () => {
    // role 1
    mockHasPacketReadPermissionForGroup.mockReturnValueOnce(true);
    mockCanReadAllPackets.mockReturnValueOnce(true);

    const result = getRolesAndUsersWithOnlyReadGroupPermission(mockRoles, mockUsers, "globalGroup");

    expect(result).toEqual([]);
  });

  it("should not return roles and users with manage permissions", () => {
    // role 1
    mockHasPacketReadPermissionForGroup.mockReturnValueOnce(true);
    mockCanManagePacketGroup.mockReturnValueOnce(true);

    const result = getRolesAndUsersWithOnlyReadGroupPermission(mockRoles, mockUsers, "manageGroup");

    expect(result).toEqual([]);
  });
});
