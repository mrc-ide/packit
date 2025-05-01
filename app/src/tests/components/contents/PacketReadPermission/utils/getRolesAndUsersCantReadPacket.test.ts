import { RoleWithRelationships } from "../../../../../app/components/contents/manageAccess/types/RoleWithRelationships";
import { UserWithRoles } from "../../../../../app/components/contents/manageAccess/types/UserWithRoles";
// eslint-disable-next-line max-len
import { getRolesAndUsersCantReadPacket } from "../../../../../app/components/contents/PacketReadPermission/utils/getRolesAndUsersCantReadPacket";

const mockCanReadPacket = jest.fn();
const mockMapPermissionsToNames = jest.fn().mockReturnValue([]);
jest.mock("../../../../../lib/constructPermissionName", () => ({
  mapPermissionsToNames: () => mockMapPermissionsToNames()
}));
jest.mock("../../../../../lib/auth/hasPermission", () => ({
  canReadPacket: () => mockCanReadPacket()
}));
describe("getRolesAndUsersCantReadPacket", () => {
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
      roles: [{ name: "role1" }],
      specificPermissions: [
        { permission: "read", packetGroup: { name: mockPacketGroupName }, packetId: { name: packetId } }
      ]
    },
    {
      id: "user2",
      roles: [{ name: "role2" }],
      specificPermissions: [
        { permission: "read", packetGroup: { name: mockPacketGroupName }, packetId: { name: "wrongId" } }
      ]
    }
  ] as unknown as UserWithRoles[];

  it("should return roles and users that cannot read the packet due direct permission", () => {
    mockCanReadPacket
      .mockReturnValueOnce(false) // role 1
      .mockReturnValueOnce(true) // role 2
      .mockReturnValueOnce(false) // user 1 direct
      .mockReturnValueOnce(false) // user 1 via role
      .mockReturnValueOnce(true) // user 2 direct
      .mockReturnValueOnce(false); // user 2 via role

    const result = getRolesAndUsersCantReadPacket(mockRoles, mockUsers, mockPacketGroupName, packetId);

    expect(mockCanReadPacket).toHaveBeenCalledTimes(5);
    expect(mockMapPermissionsToNames).toHaveBeenCalledTimes(5);
    expect(result).toEqual([mockRoles[0], mockUsers[0]]);
  });

  it("should return roles and users that cannot read the packet due users role permissions", () => {
    mockCanReadPacket
      .mockReturnValueOnce(false) // role 1
      .mockReturnValueOnce(true) // role 2
      .mockReturnValueOnce(false) // user 1 direct
      .mockReturnValueOnce(false) // user 1 via role
      .mockReturnValueOnce(false) // user 2 direct
      .mockReturnValueOnce(true); // user 2 via role

    const result = getRolesAndUsersCantReadPacket(mockRoles, mockUsers, mockPacketGroupName, packetId);

    expect(mockCanReadPacket).toHaveBeenCalledTimes(6);
    expect(mockMapPermissionsToNames).toHaveBeenCalledTimes(6);
    expect(result).toEqual([mockRoles[0], mockUsers[0]]);
  });
});
