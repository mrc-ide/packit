import { UserState } from "../../../app/components/providers/types/UserTypes";
import { hasPacketRunPermission, hasUserManagePermission } from "../../../lib/auth/hasPermission";
// TODO: fix tests
describe("hasPermission functions", () => {
  const mockUser = {
    authorities: ["user.manage", "packet.run"]
  } as UserState;

  describe("hasUserManagePermission", () => {
    test("returns true when user has 'user.manage' authority", () => {
      expect(hasPacketRunPermission(mockUser.authorities)).toBe(true);
    });

    test("returns false when user does not have 'user.manage' authority", () => {
      const userWithoutManage = { ...mockUser, authorities: ["packet.run"] };
      expect(hasUserManagePermission(userWithoutManage.authorities)).toBe(false);
    });
  });

  describe("hasPacketRunPermission", () => {
    test("returns true when user has 'packet.run' authority", () => {
      expect(hasPacketRunPermission(mockUser.authorities)).toBe(true);
    });

    test("returns false when user does not have 'packet.run' authority", () => {
      const userWithoutRun = { ...mockUser, authorities: ["user.manage"] };
      expect(hasPacketRunPermission(userWithoutRun.authorities)).toBe(false);
    });

    test("returns false when user is undefined", () => {
      expect(hasPacketRunPermission(undefined)).toBe(false);
    });
  });
});
