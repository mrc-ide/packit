import { R } from "msw/lib/glossary-de6278a9";
import { RoleWithRelationships } from "../../../../../app/components/contents/manageAccess/types/RoleWithRelationships";
import { UserWithRoles } from "../../../../../app/components/contents/manageAccess/types/UserWithRoles";
import {
  addRolesToUserData,
  addSpecificPermissionsToUserData,
  createBasicUserWithRoleIfNotExists,
  getSortedUsersWithRoles,
  getUsersWithRoles
} from "../../../../../app/components/contents/manageAccess/utils/getUsersWithRoles";
import {
  mockNonUsernameRolesWithRelationships,
  mockUsernameRolesWithRelationships,
  mockUsersWithRoles
} from "../../../../mocks";

describe("getUsersWithRoles", () => {
  it("should return users with roles correctly", () => {
    const userWithRoles = getUsersWithRoles(mockNonUsernameRolesWithRelationships, mockUsernameRolesWithRelationships);

    expect(userWithRoles).toEqual(mockUsersWithRoles);
  });

  describe("addRolesToUserData", () => {
    it("should add roles to users data correctly", () => {
      const nonUsernameRoles = [
        {
          name: "role1",
          id: 1,
          users: [
            { username: "user1", id: "1" },
            { username: "user2", id: "2" }
          ],
          isUsername: false
        },
        {
          name: "role2",
          id: 2,
          users: [
            { username: "user1", id: "1" },
            { username: "user3", id: "3" }
          ],
          isUsername: false
        }
      ] as RoleWithRelationships[];

      const usersData: Record<string, UserWithRoles> = {};

      addRolesToUserData(nonUsernameRoles, usersData);

      expect(usersData).toEqual({
        user1: {
          username: "user1",
          id: "1",
          roles: [
            { name: "role1", id: 1 },
            { name: "role2", id: 2 }
          ],
          specificPermissions: []
        },
        user2: { username: "user2", id: "2", roles: [{ name: "role1", id: 1 }], specificPermissions: [] },
        user3: { username: "user3", id: "3", roles: [{ name: "role2", id: 2 }], specificPermissions: [] }
      });
    });
  });

  describe("addSpecificPermissionsToUserData", () => {
    const usernameRoles = [
      {
        name: "user1",
        id: 1,
        users: [{ username: "user1", id: "abcd" }],
        rolePermissions: [{ permission: "permission1", id: 1, packet: null, tag: null, packetGroup: null }],
        isUsername: true
      },
      {
        name: "user2",
        id: 1,
        users: [{ username: "user2", id: "xyzc" }],
        rolePermissions: [{ permission: "permission2", id: 1 }],
        isUsername: true
      }
    ] as RoleWithRelationships[];

    const usersData: Record<string, UserWithRoles> = {};

    addSpecificPermissionsToUserData(usernameRoles, usersData);

    it("should add specific permissions to users data correctly", () => {
      expect(usersData).toEqual({
        user1: {
          username: "user1",
          id: "abcd",
          roles: [],
          specificPermissions: [{ permission: "permission1", id: 1, packet: null, tag: null, packetGroup: null }]
        },
        user2: {
          username: "user2",
          id: "xyzc",
          roles: [],
          specificPermissions: [{ permission: "permission2", id: 1 }]
        }
      });
    });
  });

  describe("getSortedUsersWithRoles", () => {
    it("should sort users data correctly by username key", () => {
      const usersData = {
        user2: { username: "user2", id: "2", roles: [], specificPermissions: [] },
        user3: { username: "user3", id: "3", roles: [], specificPermissions: [] },
        user1: { username: "user1", id: "1", roles: [], specificPermissions: [] }
      };
      const sortedUsers = getSortedUsersWithRoles(usersData);

      expect(sortedUsers).toEqual([
        { username: "user1", id: "1", roles: [], specificPermissions: [] },
        { username: "user2", id: "2", roles: [], specificPermissions: [] },
        { username: "user3", id: "3", roles: [], specificPermissions: [] }
      ]);
    });
  });

  describe("createBasicUserWithRoleIfNotExists", () => {
    it("should create basic user with role if not exists", () => {
      const usersData: Record<string, UserWithRoles> = {};

      const username = "user1";
      const id = "1";

      createBasicUserWithRoleIfNotExists(username, id, usersData);

      expect(usersData).toEqual({
        user1: { username: "user1", id: "1", roles: [], specificPermissions: [] }
      });
    });
  });
});
