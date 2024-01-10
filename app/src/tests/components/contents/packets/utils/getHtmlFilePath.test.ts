import { getHtmlFilePath } from "../../../../../app/components/contents/packets/utils/htmlFile";
import { PacketMetadata } from "../../../../../types";
import { mockPacket } from "../../../../mocks";

describe("getHtmlFilePath", () => {
  it("returns null if getHashOfHtmlFileIfExists returns null", () => {
    expect(getHtmlFilePath({ files: [] } as unknown as PacketMetadata)).toBe(null);
  });

  it("returns the correct path if getHashOfHtmlFileIfExists returns a hash and path", () => {
    expect(getHtmlFilePath(mockPacket)).toBe(
      `packets/file/${mockPacket.files[1].hash}?inline=true&filename=${mockPacket.files[1].path}`
    );
  });
});
