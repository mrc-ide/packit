// eslint-disable-next-line max-len
import { getRolesAndUsersCantReadGroup } from "../../../../../app/components/contents/home/utils/getRolesAndUsersCantReadGroup";
import { RoleWithRelationships } from "../../../../../app/components/contents/manageAccess/types/RoleWithRelationships";
import { UserWithPermissions } from "../../../../../app/components/contents/manageAccess/types/UserWithPermissions";

const mockCanReadPacketGroup = jest.fn();
const mockMapPermissionsToNames = jest.fn().mockReturnValue([]);
jest.mock("../../../../../lib/auth/hasPermission", () => ({
  canReadPacketGroup: () => mockCanReadPacketGroup()
}));
jest.mock("../../../../../lib/constructPermissionName", () => ({
  mapPermissionsToNames: () => mockMapPermissionsToNames()
}));

describe("getRolesAndUsersCantReadGroup", () => {
  const mockPacketGroupName = "testGroup";
  const mockRoles = [
    {
      name: "role1",
      rolePermissions: [{ permission: "read", packetGroup: { name: mockPacketGroupName } }]
    },
    {
      name: "role2",
      rolePermissions: [{ permission: "read", packetGroup: { name: "otherGroup" } }]
    }
  ] as unknown as RoleWithRelationships[];

  const mockUsers = [
    {
      name: "user1",
      roles: [{ name: "role1" }],
      specificPermissions: [{ permission: "read", packetGroup: { name: mockPacketGroupName } }]
    },
    {
      name: "user2",
      roles: [{ name: "role2" }],
      specificPermissions: [{ permission: "read", packetGroup: { name: "otherGroup" } }]
    }
  ] as unknown as UserWithPermissions[];

  it("should return roles and users that cannot read the group due direct permission", () => {
    mockCanReadPacketGroup
      .mockReturnValueOnce(false) // role 1
      .mockReturnValueOnce(true) // role 2
      .mockReturnValueOnce(false) // user 1 direct
      .mockReturnValueOnce(false) // user 1 via role
      .mockReturnValueOnce(true) // user 2 direct
      .mockReturnValueOnce(false); // user 2 via role

    const result = getRolesAndUsersCantReadGroup(mockRoles, mockUsers, mockPacketGroupName);

    expect(mockCanReadPacketGroup).toHaveBeenCalledTimes(5);
    expect(mockMapPermissionsToNames).toHaveBeenCalledTimes(5);
    expect(result).toEqual([mockRoles[0], mockUsers[0]]);
  });

  it("should return roles and users that cannot read the group due users role permissions", () => {
    mockCanReadPacketGroup
      .mockReturnValueOnce(false) // role 1
      .mockReturnValueOnce(true) // role 2
      .mockReturnValueOnce(false) // user 1 direct
      .mockReturnValueOnce(false) // user 1 via role
      .mockReturnValueOnce(false) // user 2 direct
      .mockReturnValueOnce(true); // user 2 via role

    const result = getRolesAndUsersCantReadGroup(mockRoles, mockUsers, mockPacketGroupName);

    expect(mockCanReadPacketGroup).toHaveBeenCalledTimes(6);
    expect(mockMapPermissionsToNames).toHaveBeenCalledTimes(6);
    expect(result).toEqual([mockRoles[0], mockUsers[0]]);
  });
});
