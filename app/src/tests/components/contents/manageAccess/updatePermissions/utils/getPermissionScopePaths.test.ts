// eslint-disable-next-line max-len
import {
  getPermissionScopePaths
} from "../../../../../../app/components/contents/manageAccess/updatePermission/utils/getPermissionScopePaths";

describe("getScopePaths", () => {
  test("should return correct paths when filterName contains colon", () => {
    const result = getPermissionScopePaths("filterName:filterId");
    expect(result).toEqual({
      global: null,
      packet: "packets?filterName=filterName&filterId=filterId",
      tag: "tag?filterName=filterName",
      packetGroup: "packetGroups?filterName=filterName"
    });
  });

  test("should return correct paths when filterName does not contain colon", () => {
    const result = getPermissionScopePaths("filterName");
    expect(result).toEqual({
      global: null,
      packet: "packets?filterName=filterName&filterId=",
      tag: "tag?filterName=filterName",
      packetGroup: "packetGroups?filterName=filterName"
    });
  });

  test("should return correct paths when filterName is empty", () => {
    const result = getPermissionScopePaths("");
    expect(result).toEqual({
      global: null,
      packet: "packets?filterName=&filterId=",
      tag: "tag?filterName=",
      packetGroup: "packetGroups?filterName="
    });
  });
});
