import { constructPermissionName } from "../../lib/constructPermissionName";

describe("constructPermissionName", () => {
  it("should return permission:packet:id when packet is present", () => {
    const result = constructPermissionName({
      id: 1,
      permission: "read",
      packet: { id: "123", name: "packet1" },
      tag: null,
      packetGroup: null
    });
    expect(result).toEqual("read:packet:123");
  });

  it("should return permission:tag:name when tag is present", () => {
    const result = constructPermissionName({
      id: 1,
      permission: "read",
      packet: null,
      tag: { name: "tag1", id: 1 },
      packetGroup: null
    });
    expect(result).toEqual("read:tag:tag1");
  });

  it("should return permission:packetGroup:name when packetGroup is present", () => {
    const result = constructPermissionName({
      id: 1,
      permission: "read",
      packet: null,
      tag: null,
      packetGroup: { name: "group1", id: 1 }
    });
    expect(result).toEqual("read:packetGroup:group1");
  });

  it("should return permission when packet, tag and packetGroup are not present", () => {
    const result = constructPermissionName({
      id: 1,
      permission: "read",
      packet: null,
      tag: null,
      packetGroup: null
    });
    expect(result).toEqual("read");
  });
});
