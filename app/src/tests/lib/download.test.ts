import { downloadFileUri } from "../../msw/handlers/downloadFileHandlers";
import { download, getFileObjectUrl, getFileUrl } from "../../lib/download";
import { mockFileBlob } from "../mocks";
import { server } from "../../msw/server";
import { rest } from "msw";
import { FileMetadata } from "../../types";
import appConfig from "../../config/appConfig";

jest.mock("../../lib/auth/getAuthHeader", () => ({
  getAuthHeader: () => ({ Authorization: "fakeAuthHeader" })
}));

const url = `${downloadFileUri}?filename=test.txt`;
const testFile: FileMetadata = {
  hash: "testHash",
  path: "testPath",
  size: 30
};

describe("download", () => {
  const fakeObjectUrl = "fakeObjectUrl";

  it("downloads on successful response", async () => {
    const mockCreateObjectUrl = jest.fn(() => fakeObjectUrl);
    const mockRevokeObjectUrl = jest.fn();

    URL.createObjectURL = mockCreateObjectUrl;
    URL.revokeObjectURL = mockRevokeObjectUrl;

    const mockFileLink = {
      href: "",
      setAttribute: jest.fn(),
      click: jest.fn()
    } as any;

    const mockAppendChild = jest.fn();
    const mockRemoveChild = jest.fn();

    document.createElement = () => mockFileLink;
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;

    await download(url, "test.txt");

    expect(mockCreateObjectUrl).toHaveBeenCalledWith(mockFileBlob);
    expect(mockFileLink.setAttribute).toHaveBeenCalledWith("download", "test.txt");
    expect(mockAppendChild).toHaveBeenCalledWith(mockFileLink);
    expect(mockFileLink.click).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalledWith(mockFileLink);
    expect(mockRevokeObjectUrl).toHaveBeenCalledWith(fakeObjectUrl);
  });

  const setupUnsuccessfulResponse = (responseJson: object) => {
    server.use(
      rest.get(downloadFileUri, (req, res, ctx) => {
        return res(ctx.status(500), ctx.json(responseJson));
      })
    );
  };

  it("throws error on unsuccessful response", async () => {
    setupUnsuccessfulResponse({
      error: {
        error: "OTHER_ERROR",
        detail: "test server error"
      }
    });

    await expect(download(url, "test.txt")).rejects.toEqual(new Error("Error: test server error"));
  });

  it("throws error with default message on unsuccessful response", async () => {
    setupUnsuccessfulResponse({
      error: {
        error: "OTHER_ERROR"
      }
    });

    await expect(download(url, "test.txt")).rejects.toEqual(new Error("Error downloading test.txt"));
  });

  it("can getFileObjectUrl", async () => {
    const mockCreateObjectUrl = jest.fn(() => fakeObjectUrl);

    URL.createObjectURL = mockCreateObjectUrl;

    const result = await getFileObjectUrl(url, "test.txt");
    expect(result).toBe(fakeObjectUrl);
    expect(mockCreateObjectUrl).toHaveBeenCalledWith(mockFileBlob);
  });

  it("can get file url for request a file with inline content-disposition", () => {
    const result = getFileUrl(testFile, "testPacketId", true);

    expect(result).toBe(`${appConfig.apiUrl()}/packets/file/testPacketId?hash=testHash&filename=testPath&inline=true`);
  });

  it("can get file url for request a file with attachment content-disposition", () => {
    const result = getFileUrl(testFile, "testPacketId");

    expect(result).toBe(`${appConfig.apiUrl()}/packets/file/testPacketId?hash=testHash&filename=testPath&inline=false`);
  });
});
