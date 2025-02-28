import { download, getFileObjectUrl } from "../../lib/download";
import { mockFileBlob } from "../mocks";
import { server } from "../../msw/server";
import { rest } from "msw";
import { FileMetadata } from "../../types";
import appConfig from "../../config/appConfig";

jest.mock("../../lib/auth/getAuthHeader", () => ({
  getAuthHeader: () => ({ Authorization: "fakeAuthHeader" })
}));

const testFile1: FileMetadata = {
  hash: "testHash",
  path: "test1.txt",
  size: 30
};
const testFile2: FileMetadata = {
  hash: "testHash",
  path: "test2.txt",
  size: 90
};

let fetchSpy: jest.SpyInstance;

beforeEach(async () => {
  fetchSpy = jest.spyOn(global, "fetch");
});

afterEach(() => {
  fetchSpy.mockRestore();
});

const setUpUnsuccessfulTokenResponse = () => {
  server.use(
    rest.post(`${appConfig.apiUrl()}/packets/fakePacketId/files/token`, (req, res, ctx) => {
      return res(
        ctx.status(500),
        ctx.json({
          error: {
            error: "OTHER_ERROR",
            detail: "test token endpoint error"
          }
        })
      );
    })
  );
};

describe("download", () => {
  it("getFileObjectUrl can fetch a file and pack it into a blob URL", async () => {
    const mockCreateObjectUrl = jest.fn(() => "fakeObjectUrl");
    URL.createObjectURL = mockCreateObjectUrl;

    await getFileObjectUrl(testFile1, "fakePacketId", "fakeFilename");

    expect(fetchSpy).toHaveBeenCalledWith(`${appConfig.apiUrl()}/packets/fakePacketId/files/token?paths=test1.txt`, {
      method: "POST",
      headers: { Authorization: "fakeAuthHeader" }
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      `${appConfig.apiUrl()}/packets/fakePacketId/files?paths=test1.txt&token=fakeTokenId&filename=fakeFilename&inline=true`,
      {
        method: "GET"
      }
    );

    expect(mockCreateObjectUrl).toHaveBeenCalledWith(mockFileBlob);
  });

  it("download function can download files by clicking on an anchor tag with a 'download' attribute", async () => {
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

    await download([testFile1, testFile2], "fakePacketId", "fakeFilename");

    expect(fetchSpy).toHaveBeenCalledWith(
      `${appConfig.apiUrl()}/packets/fakePacketId/files/token?paths=test1.txt&paths=test2.txt`,
      {
        method: "POST",
        headers: { Authorization: "fakeAuthHeader" }
      }
    );

    expect(mockFileLink.href).toBe(
      `${appConfig.apiUrl()}/packets/fakePacketId/files?` +
        `paths=test1.txt&paths=test2.txt&token=fakeTokenId&filename=fakeFilename&inline=false`
    );
    expect(mockFileLink.setAttribute).toHaveBeenCalledWith("download", "fakeFilename");
    expect(mockAppendChild).toHaveBeenCalledWith(mockFileLink);
    expect(mockFileLink.click).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalledWith(mockFileLink);
  });

  it("getFileObjectUrl throws error on unsuccessful response from /token endpoint", async () => {
    setUpUnsuccessfulTokenResponse();

    await expect(getFileObjectUrl(testFile1, "fakePacketId", "fakeFilename")).rejects.toEqual(
      new Error("Error: test token endpoint error")
    );
  });

  it("getFileObjectUrl throws error on unsuccessful response from /files endpoint", async () => {
    server.use(
      rest.get(`${appConfig.apiUrl()}/packets/fakePacketId/files`, (req, res, ctx) => {
        return res(
          ctx.status(500),
          ctx.json({
            error: {
              error: "OTHER_ERROR",
              detail: "test files endpoint error"
            }
          })
        );
      })
    );

    await expect(getFileObjectUrl(testFile1, "fakePacketId", "fakeFilename")).rejects.toEqual(
      new Error("Error: test files endpoint error")
    );
  });

  it("download throws error on unsuccessful response from /token endpoint", async () => {
    setUpUnsuccessfulTokenResponse();

    await expect(download([testFile1], "fakePacketId", "fakeFilename")).rejects.toEqual(
      new Error("Error: test token endpoint error")
    );
  });
});
