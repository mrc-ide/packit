import { RoleWithRelationships } from "../../../../../app/components/contents/manageAccess/types/RoleWithRelationships";
import { UserWithPermissions } from "../../../../../app/components/contents/manageAccess/types/UserWithPermissions";
// eslint-disable-next-line max-len
import { getRolesUsersWithOnlyReadPacketPermission } from "../../../../../app/components/contents/PacketReadPermission/utils/getRolesUsersWithOnlyReadPacketPermission";

const mockMapPermissionsToNames = jest.fn().mockReturnValue([]);
const mockHasPacketReadPermissionForPacket = jest.fn();
const mockCanReadPacketGroup = jest.fn();
const mockCanManagePacket = jest.fn();
jest.mock("../../../../../lib/constructPermissionName", () => ({
  mapPermissionsToNames: () => mockMapPermissionsToNames()
}));
jest.mock("../../../../../lib/auth/hasPermission", () => ({
  hasPacketReadPermissionForPacket: () => mockHasPacketReadPermissionForPacket(),
  canReadPacketGroup: () => mockCanReadPacketGroup(),
  canManagePacket: () => mockCanManagePacket()
}));

describe("getRolesUsersWithOnlyReadPacketPermission", () => {
  const mockPacketGroupName = "testGroup";
  const packetId = "testPacketId";
  const mockRoles = [
    {
      id: "role1",
      rolePermissions: [
        { permission: "read", packetGroup: { name: mockPacketGroupName }, packetId: { name: packetId } }
      ]
    },
    {
      id: "role2",
      rolePermissions: [
        { permission: "read", packetGroup: { name: mockPacketGroupName }, packetId: { name: "wrongId" } }
      ]
    }
  ] as unknown as RoleWithRelationships[];

  const mockUsers = [
    {
      id: "user1",
      specificPermissions: [
        { permission: "read", packetGroup: { name: mockPacketGroupName }, packetId: { name: packetId } }
      ]
    },
    {
      id: "user2",
      specificPermissions: [
        { permission: "read", packetGroup: { name: mockPacketGroupName }, packetId: { name: "wrongId" } }
      ]
    }
  ] as unknown as UserWithPermissions[];

  it("should return roles and users with read permissions for the specified packet group", () => {
    for (let i = 0; i < mockRoles.length + mockUsers.length; i++) {
      // role 1, user 1
      if (i % 2 == 0) {
        mockHasPacketReadPermissionForPacket.mockReturnValueOnce(true);
      } else {
        // role 2, user 2
        mockHasPacketReadPermissionForPacket.mockReturnValueOnce(false);
      }
    }

    const result = getRolesUsersWithOnlyReadPacketPermission(mockRoles, mockUsers, mockPacketGroupName, packetId);

    expect(mockHasPacketReadPermissionForPacket).toHaveBeenCalledTimes(4);
    expect(mockMapPermissionsToNames).toHaveBeenCalledTimes(4);
    expect(mockCanReadPacketGroup).toHaveBeenCalledTimes(2);
    expect(mockCanManagePacket).toHaveBeenCalledTimes(2);
    expect(result).toEqual([mockRoles[0], mockUsers[0]]);
  });

  it("should not return roles and users if can read packet group", () => {
    // role 1
    mockHasPacketReadPermissionForPacket.mockReturnValueOnce(true);
    mockCanReadPacketGroup.mockReturnValueOnce(true);

    const result = getRolesUsersWithOnlyReadPacketPermission(mockRoles, mockUsers, mockPacketGroupName, packetId);

    expect(result).toEqual([]);
  });

  it("should not return roles and users with manage permissions", () => {
    // role 1
    mockHasPacketReadPermissionForPacket.mockReturnValueOnce(true);
    mockCanManagePacket.mockReturnValueOnce(true);

    const result = getRolesUsersWithOnlyReadPacketPermission(mockRoles, mockUsers, mockPacketGroupName, packetId);

    expect(result).toEqual([]);
  });
});
