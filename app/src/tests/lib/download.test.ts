import { rest } from "msw";
import appConfig from "@config/appConfig";
import { download, getFileObjectUrl } from "@lib/download";
import { server } from "@/msw/server";
import { mockPacket } from "../mocks";
import * as fetch from "@lib/fetch.ts";
import {ApiError} from "@lib/errors.ts";

vitest.mock("@lib/auth/getAuthHeader", () => ({
  getAuthHeader: () => ({ Authorization: "fakeAuthHeader" })
}));

let fetchSpy: any;
let fetcherSpy: any;
let windowSpy: any;

const testWindowLocation = `${appConfig.apiUrl()}/path/subpath`;

beforeEach(async () => {
  fetchSpy = vitest.spyOn(global, "fetch");
  fetcherSpy = vitest.spyOn(fetch, "fetcher");
  windowSpy = vitest.spyOn(globalThis, "window", "get");
  windowSpy.mockImplementation(() => ({
    location: {
      href: testWindowLocation
    }
  }));
});

afterEach(() => {
  fetchSpy.mockRestore();
  fetcherSpy.mockRestore();
  windowSpy.mockRestore();
  vitest.unstubAllGlobals();
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
    const mockCreateObjectUrl = vitest.fn(() => "fakeObjectUrl");
    URL.createObjectURL = mockCreateObjectUrl;

    const file = mockPacket.files[0];
    await getFileObjectUrl(file, mockPacket.id, "directory/fakeFilename");

    expect(fetcherSpy).toHaveBeenCalledWith(
      {
        url: `${appConfig.apiUrl()}/packets/${mockPacket.id}/files/token`,
        method: "POST",
        body: {
            paths: [file.path]
        }
      }
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      `${appConfig.apiUrl()}/packets/${mockPacket.id}/file` +
        `?path=${mockPacket.files[0].path}&token=fakeTokenId&filename=directory%2FfakeFilename&inline=true`,
      {
        method: "GET"
      }
    );

    expect(mockCreateObjectUrl).toHaveBeenCalledTimes(1);
  });

  it("can download a stream of a single file by clicking on an anchor tag with a 'download' attribute", async () => {
    const mockFileLink = {
      href: "",
      setAttribute: vitest.fn(),
      click: vitest.fn()
    } as any;

    const mockAppendChild = vitest.fn();
    const mockRemoveChild = vitest.fn();

    document.createElement = () => mockFileLink;
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;

    const file = mockPacket.files[0];
    await download([file], mockPacket.id, "fakeFilename");

    expect(fetcherSpy).toHaveBeenCalledWith(
      {
        url: `${appConfig.apiUrl()}/packets/${mockPacket.id}/files/token`,
        method: "POST",
        body: { paths: [file.path] }
      }
    );

    expect(mockFileLink.href).toEqual(
      `${appConfig.apiUrl()}/packets/${mockPacket.id}/file?` +
        `path=${mockPacket.files[0].path}&token=fakeTokenId&filename=fakeFilename&inline=false`
    );
    expect(mockFileLink.setAttribute).toHaveBeenCalledWith("download", "fakeFilename");
    expect(mockAppendChild).toHaveBeenCalledWith(mockFileLink);
    expect(mockFileLink.click).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalledWith(mockFileLink);
  });

  it("can download a stream of multiple files as zip (even if zip format was not specifically requested)", async () => {
    const mockFileLink = {
      href: "",
      setAttribute: vitest.fn(),
      click: vitest.fn()
    } as any;

    const mockAppendChild = vitest.fn();
    const mockRemoveChild = vitest.fn();

    document.createElement = () => mockFileLink;
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;

    const files = [mockPacket.files[0], mockPacket.files[1]];
    await download(files, mockPacket.id, "fakeFilename");

    expect(fetcherSpy).toHaveBeenCalledWith(
      {
        url: `${appConfig.apiUrl()}/packets/${mockPacket.id}/files/token`,
        method: "POST",
        body: { paths: [files[0].path, files[1].path] }
      }
    );

    expect(mockFileLink.href).toBe(
      `${appConfig.apiUrl()}/packets/${mockPacket.id}/files/zip?` +
        `token=fakeTokenId&filename=fakeFilename&inline=false`
    );
    expect(mockFileLink.setAttribute).toHaveBeenCalledWith("download", "fakeFilename");
    expect(mockAppendChild).toHaveBeenCalledWith(mockFileLink);
    expect(mockFileLink.click).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalledWith(mockFileLink);
  });

  it("can download a stream of a single file as a zip, if zip format was specifically requested", async () => {
    const mockFileLink = {
      href: "",
      setAttribute: vitest.fn(),
      click: vitest.fn()
    } as any;

    const mockAppendChild = vitest.fn();
    const mockRemoveChild = vitest.fn();

    document.createElement = () => mockFileLink;
    document.body.appendChild = mockAppendChild;
    document.body.removeChild = mockRemoveChild;

    const file = mockPacket.files[0];
    await download([file], mockPacket.id, "fakeFilename", true);

    expect(fetcherSpy).toHaveBeenCalledWith(
       {
        url: `${appConfig.apiUrl()}/packets/${mockPacket.id}/files/token`,
        method: "POST",
        body: {
            paths: [file.path]
        }
      }
    );

    expect(mockFileLink.href).toBe(
      `${appConfig.apiUrl()}/packets/${mockPacket.id}/files/zip?` +
        `token=fakeTokenId&filename=fakeFilename&inline=false`
    );
    expect(mockFileLink.setAttribute).toHaveBeenCalledWith("download", "fakeFilename");
    expect(mockAppendChild).toHaveBeenCalledWith(mockFileLink);
    expect(mockFileLink.click).toHaveBeenCalled();
    expect(mockRemoveChild).toHaveBeenCalledWith(mockFileLink);
  });

  it("getFileObjectUrl throws error on unsuccessful response from /token endpoint", async () => {
    setUpUnsuccessfulTokenResponse();

    await expect(getFileObjectUrl(mockPacket.files[0], mockPacket.id, "fakeFilename")).rejects.toEqual(
      new ApiError("test token endpoint error", 500)
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
      new ApiError("test token endpoint error", 500)
    );
  });

});
