import { buildScopedPermission, constructPermissionName } from "../../lib/constructPermissionName";

describe("constructPermissionName", () => {
  it("should return permission:packet:id when packet is present", () => {
    const result = constructPermissionName({
      permission: "read",
      packet: { id: "123", name: "packet1" },
      tag: null,
      packetGroup: null
    });
    expect(result).toEqual("read:packet:packet1:123");
  });

  it("should return permission:tag:name when tag is present", () => {
    const result = constructPermissionName({
      permission: "read",
      packet: null,
      tag: { name: "tag1", id: 1 },
      packetGroup: null
    });
    expect(result).toEqual("read:tag:tag1");
  });

  it("should return permission:packetGroup:name when packetGroup is present", () => {
    const result = constructPermissionName({
      permission: "read",
      packet: null,
      tag: null,
      packetGroup: { name: "group1", id: 1 }
    });
    expect(result).toEqual("read:packetGroup:group1");
  });

  it("should return permission when packet, tag and packetGroup are not present", () => {
    const result = constructPermissionName({
      permission: "read",
      packet: null,
      tag: null,
      packetGroup: null
    });
    expect(result).toEqual("read");
  });
});

describe("buildScopedPermission", () => {
  it("should return permission:packet:packetGroupName:packetId when packetGroupName and packetId are provided", () => {
    const result = buildScopedPermission("read", "group1", "123", undefined);
    expect(result).toEqual("read:packet:group1:123");
  });

  it("should return permission:packetGroup:packetGroupName when only packetGroupName is provided", () => {
    const result = buildScopedPermission("read", "group1", undefined, undefined);
    expect(result).toEqual("read:packetGroup:group1");
  });

  it("should return permission:tag:tagName when only tag is provided", () => {
    const result = buildScopedPermission("read", undefined, undefined, "tag1");
    expect(result).toEqual("read:tag:tag1");
  });

  it("should return permission when no packetGroupName, packetId, or tag is provided", () => {
    const result = buildScopedPermission("read", undefined, undefined, undefined);
    expect(result).toEqual("read");
  });

  it("should throw an error when both packetGroupName and tag are provided", () => {
    expect(() => buildScopedPermission("read", "group1", undefined, "tag1")).toThrow(
      "Only one of packetGroupName or tag can be provided"
    );
  });

  it("should throw an error when packetId is provided without packetGroupName", () => {
    expect(() => buildScopedPermission("read", undefined, "123", undefined)).toThrow(
      "packetGroupName must be provided if packetId is given"
    );
  });
});
