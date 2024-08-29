import { UserState } from "../../../app/components/providers/types/UserTypes";
import { hasPacketRunPermission, hasUserManagePermission } from "../../../lib/auth/hasPermission";

describe("hasPermission functions", () => {
  const mockUser = {
    authorities: ["user.manage", "packet.run"]
  } as UserState;

  describe("hasUserManagePermission", () => {
    test("returns true when user has 'user.manage' authority", () => {
      expect(hasPacketRunPermission(mockUser)).toBe(true);
    });

    test("returns false when user does not have 'user.manage' authority", () => {
      const userWithoutManage = { ...mockUser, authorities: ["packet.run"] };
      expect(hasUserManagePermission(userWithoutManage)).toBe(false);
    });

    test("returns false when user is null", () => {
      expect(hasUserManagePermission(null)).toBe(false);
    });
  });

  describe("hasPacketRunPermission", () => {
    test("returns true when user has 'packet.run' authority", () => {
      expect(hasPacketRunPermission(mockUser)).toBe(true);
    });

    test("returns false when user does not have 'packet.run' authority", () => {
      const userWithoutRun = { ...mockUser, authorities: ["user.manage"] };
      expect(hasPacketRunPermission(userWithoutRun)).toBe(false);
    });

    test("returns false when user is null", () => {
      expect(hasPacketRunPermission(null)).toBe(false);
    });
  });
});
