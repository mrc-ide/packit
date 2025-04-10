import { download, getFileObjectUrl } from "../../lib/download";
import { mockFileBlob, mockPacket } from "../mocks";
import { server } from "../../msw/server";
import { rest } from "msw";
import appConfig from "../../config/appConfig";

jest.mock("../../lib/auth/getAuthHeader", () => ({
  getAuthHeader: () => ({ Authorization: "fakeAuthHeader" })
}));

let fetchSpy: jest.SpyInstance;

beforeEach(async () => {
  fetchSpy = jest.spyOn(global, "fetch");
});

afterEach(() => {
  fetchSpy.mockRestore();
});

const setUpUnsuccessfulTokenResponse = () => {
  server.use(
    rest.post(`${appConfig.apiUrl()}/packets/${mockPacket.id}/files/token`, (req, res, ctx) => {
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

    await getFileObjectUrl(mockPacket.files[0], mockPacket.id, "fakeFilename");

    expect(fetchSpy).toHaveBeenCalledWith(
      `${appConfig.apiUrl()}/packets/${mockPacket.id}/files/token?paths=${mockPacket.files[0].path}`,
      {
        method: "POST",
        headers: { Authorization: "fakeAuthHeader" }
      }
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      `${appConfig.apiUrl()}/packets/${mockPacket.id}/file` +
        `?path=${mockPacket.files[0].path}&token=fakeTokenId&filename=fakeFilename&inline=true`,
      {
        method: "GET"
      }
    );

    expect(mockCreateObjectUrl).toHaveBeenCalledWith(mockFileBlob);
  });

  it("download function can download a stream of a single file by clicking on an anchor tag with a 'download' attribute", async () => {
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

    await download([mockPacket.files[0]], mockPacket.id, "fakeFilename");

    expect(fetchSpy).toHaveBeenCalledWith(
      `${appConfig.apiUrl()}/packets/${mockPacket.id}/files/token?paths=${mockPacket.files[0].path}`,
      {
        method: "POST",
        headers: { Authorization: "fakeAuthHeader" }
      }
    );

    expect(mockFileLink.href).toBe(
      `${appConfig.apiUrl()}/packets/${mockPacket.id}/file?` +
        `path=${mockPacket.files[0].path}&token=fakeTokenId&filename=fakeFilename&inline=false`
    );
    expect(mockFileLink.setAttribute).toHaveBeenCalledWith("download", "fakeFilename");
    expect(mockAppendChild).toHaveBeenCalledWith(mockFileLink);
    expect(mockFileLink.click).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalledWith(mockFileLink);
  });

  it("download function can download a stream of multiple files as a zip by clicking on an anchor tag with a 'download' attribute", async () => {
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

    await download([mockPacket.files[0], mockPacket.files[1]], mockPacket.id, "fakeFilename");

    expect(fetchSpy).toHaveBeenCalledWith(
      `${appConfig.apiUrl()}/packets/${mockPacket.id}/files/token?paths=${mockPacket.files[0].path}&paths=${
        mockPacket.files[1].path
      }`,
      {
        method: "POST",
        headers: { Authorization: "fakeAuthHeader" }
      }
    );

    expect(mockFileLink.href).toBe(
      `${appConfig.apiUrl()}/packets/${mockPacket.id}/files/zip?` +
        `paths=${mockPacket.files[0].path}&paths=${mockPacket.files[1].path}` +
        `&token=fakeTokenId&filename=fakeFilename&inline=false`
    );
    expect(mockFileLink.setAttribute).toHaveBeenCalledWith("download", "fakeFilename");
    expect(mockAppendChild).toHaveBeenCalledWith(mockFileLink);
    expect(mockFileLink.click).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalledWith(mockFileLink);
  });

  it("getFileObjectUrl throws error on unsuccessful response from /token endpoint", async () => {
    setUpUnsuccessfulTokenResponse();

    await expect(getFileObjectUrl(mockPacket.files[0], mockPacket.id, "fakeFilename")).rejects.toEqual(
      new Error("Error: test token endpoint error")
    );
  });

  it("getFileObjectUrl throws error on unsuccessful response from file endpoint", async () => {
    server.use(
      rest.get(`${appConfig.apiUrl()}/packets/${mockPacket.id}/file`, (req, res, ctx) => {
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

    await expect(getFileObjectUrl(mockPacket.files[0], mockPacket.id, "fakeFilename")).rejects.toEqual(
      new Error("Error: test files endpoint error")
    );
  });

  it("download throws error on unsuccessful response from /token endpoint", async () => {
    setUpUnsuccessfulTokenResponse();

    await expect(download([mockPacket.files[0]], mockPacket.id, "fakeFilename")).rejects.toEqual(
      new Error("Error: test token endpoint error")
    );
  });
});
