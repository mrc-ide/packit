// eslint-disable-next-line max-len
import { getScopePaths } from "../../../../../../app/components/contents/manageAccess/updatePermission/utils/getScopePaths";

describe("getScopePaths", () => {
  test("should return correct paths when filterName contains colon", () => {
    const result = getScopePaths("filterName:filterId");
    expect(result).toEqual({
      global: null,
      packet: "packets?filterName=filterName&filterId=filterId",
      tag: "tag?filterName=filterName",
      packetGroup: "packetGroup?filterName=filterName"
    });
  });

  test("should return correct paths when filterName does not contain colon", () => {
    const result = getScopePaths("filterName");
    expect(result).toEqual({
      global: null,
      packet: "packets?filterName=filterName&filterId=",
      tag: "tag?filterName=filterName",
      packetGroup: "packetGroup?filterName=filterName"
    });
  });

  test("should return correct paths when filterName is empty", () => {
    const result = getScopePaths("");
    expect(result).toEqual({
      global: null,
      packet: "packets?filterName=&filterId=",
      tag: "tag?filterName=",
      packetGroup: "packetGroup?filterName="
    });
  });
});
