import {
  canManageAllPackets,
  canManagePacket,
  canManagePacketGroup,
  hasGlobalPacketManagePermission,
  hasGlobalReadPermission,
  hasPacketManagePermissionForGroup,
  hasPacketManagePermissionForPacket,
  hasPacketRunPermission,
  hasUserManagePermission
} from "@lib/auth/hasPermission";

describe("hasPermission functions", () => {
  describe("Global permission functions", () => {
    describe("hasUserManagePermission", () => {
      it("returns true when has 'user.manage' authority", () => {
        const authorities = ["user.manage", "packet.run"];
        expect(hasPacketRunPermission(authorities)).toBe(true);
      });

      it("returns false when does not have 'user.manage' authority", () => {
        const authorities = ["packet.run"];
        expect(hasUserManagePermission(authorities)).toBe(false);
      });
    });

    describe("hasPacketRunPermission", () => {
      it("returns true when has 'packet.run' authority", () => {
        const authorities = ["packet.run", "user.manage"];
        expect(hasPacketRunPermission(authorities)).toBe(true);
      });

      it("returns false when does not have 'packet.run' authority", () => {
        const authorities = ["user.manage"];
        expect(hasPacketRunPermission(authorities)).toBe(false);
      });

      it("returns false when is undefined", () => {
        expect(hasPacketRunPermission(undefined)).toBe(false);
      });
    });
    describe("hasGlobalPacketManagePermission", () => {
      it("returns true when has 'packet.manage' authority", () => {
        expect(hasGlobalPacketManagePermission(["packet.manage"])).toBe(true);
      });

      it("returns false when does not have 'packet.manage' authority", () => {
        expect(hasGlobalPacketManagePermission(["user.manage", "packet.read"])).toBe(false);
      });

      it("returns false with undefined authorities", () => {
        expect(hasGlobalPacketManagePermission(undefined)).toBe(false);
      });
    });

    describe("hasGlobalReadPermission", () => {
      it("returns true when has 'packet.read' authority", () => {
        expect(hasGlobalReadPermission(["packet.read"])).toBe(true);
      });

      it("returns false when does not have 'packet.read' authority", () => {
        expect(hasGlobalReadPermission(["user.manage", "packet.run"])).toBe(false);
      });
    });
  });

  describe("Packet management permission functions", () => {
    describe("canManageAllPackets", () => {
      it("returns true when has 'user.manage' authority", () => {
        expect(canManageAllPackets(["user.manage"])).toBe(true);
      });

      it("returns true when has 'packet.manage' authority", () => {
        expect(canManageAllPackets(["packet.manage"])).toBe(true);
      });

      it("returns false when has neither 'user.manage' nor 'packet.manage' authorities", () => {
        expect(canManageAllPackets(["packet.manage:packetGroup:groupA", "packet.run"])).toBe(false);
      });
    });

    describe("hasPacketManagePermissionForGroup", () => {
      it("returns true when has scoped manage permission for the group", () => {
        expect(hasPacketManagePermissionForGroup(["packet.manage:packetGroup:groupA"], "groupA")).toBe(true);
      });

      it("returns false when has scoped manage permission for a different group", () => {
        expect(hasPacketManagePermissionForGroup(["packet.manage:packetGroup:groupB"], "groupA")).toBe(false);
      });

      it("returns false when has only global manage permission", () => {
        expect(hasPacketManagePermissionForGroup(["packet.manage"], "groupA")).toBe(false);
      });
    });

    describe("canManagePacketGroup", () => {
      it("returns true when has global packet manage permission", () => {
        expect(canManagePacketGroup(["packet.manage"], "groupA")).toBe(true);
      });

      it("returns true when has manage permission", () => {
        expect(canManagePacketGroup(["user.manage"], "groupA")).toBe(true);
      });

      it("returns true when has scoped manage permission for the group", () => {
        expect(canManagePacketGroup(["packet.manage:packetGroup:groupA"], "groupA")).toBe(true);
      });

      it("returns false when has scoped manage permission for a different group", () => {
        expect(canManagePacketGroup(["packet.manage:packetGroup:groupB"], "groupA")).toBe(false);
      });

      it("returns false when has no relevant permissions", () => {
        expect(canManagePacketGroup(["packet.read"], "groupA")).toBe(false);
      });
    });

    describe("hasPacketManagePermissionForPacket", () => {
      it("returns true when has scoped manage permission for the packet", () => {
        const authorities = ["packet.manage:packet:groupA:packet123"];
        expect(hasPacketManagePermissionForPacket(authorities, "groupA", "packet123")).toBe(true);
      });

      it("returns false when has scoped manage permission for a different packet", () => {
        const authorities = ["packet.manage:packet:groupA:packet456"];
        expect(hasPacketManagePermissionForPacket(authorities, "groupA", "packet123")).toBe(false);
      });

      it("returns false when has only group-level manage permission", () => {
        const authorities = ["packet.manage:packet:groupA"];
        expect(hasPacketManagePermissionForPacket(authorities, "groupA", "packet123")).toBe(false);
      });

      it("returns false when has no relevant permissions", () => {
        const authorities = ["packet.read:packet:groupA:packet123"];
        expect(hasPacketManagePermissionForPacket(authorities, "groupA", "packet123")).toBe(false);
      });
    });
    describe("canManagePacket", () => {
      it("returns true when has global packet manage permission", () => {
        const authorities = ["packet.manage"];
        expect(canManagePacket(authorities, "groupA", "packet123")).toBe(true);
      });

      it("returns true when has group-level manage permission", () => {
        const authorities = ["packet.manage:packetGroup:groupA"];
        expect(canManagePacket(authorities, "groupA", "packet123")).toBe(true);
      });

      it("returns true when has scoped manage permission for the packet", () => {
        const authorities = ["packet.manage:packet:groupA:packet123"];
        expect(canManagePacket(authorities, "groupA", "packet123")).toBe(true);
      });

      it("returns false when has scoped manage permission for a different packet", () => {
        const authorities = ["packet.manage:packet:groupA:packet456"];
        expect(canManagePacket(authorities, "groupA", "packet123")).toBe(false);
      });

      it("returns false when has no relevant permissions", () => {
        const authorities = ["packet.read"];
        expect(canManagePacket(authorities, "groupA", "packet123")).toBe(false);
      });
    });
  });
});
