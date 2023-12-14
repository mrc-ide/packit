const mockAuthHeader = jest.fn();
jest.mock("../../lib/auth/getAuthHeader", () => ({
    getAuthHeader: () => mockAuthHeader()
}));

import {downloadFileUri} from "../../msw/handlers/downloadFileHandlers";
import {download} from "../../lib/download";
import {mockFileBlob} from "../mocks";
import {server} from "../../msw/server";
import {rest} from "msw";

const url = `${downloadFileUri}?filename=test.txt`;

describe("download succeeds", () => {
    const fakeObjectUrl = "fakeObjectUrl";
    it("downloads on successful response", async () => {
        mockAuthHeader.mockImplementation(() => ({Authorization: "fakeAuthHeader"}));

        const mockCreateObjectUrl = jest.fn(() => fakeObjectUrl)
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

        const spyOnFetch = jest.spyOn(window, "fetch");

        await download(url, "test.txt");

        expect(spyOnFetch).toHaveBeenCalledWith(url, {
            method: "GET",
            headers: {
                Authorization: "fakeAuthHeader"
            }
        });

        expect(mockCreateObjectUrl).toHaveBeenCalledWith(mockFileBlob);
        expect(mockFileLink.setAttribute).toHaveBeenCalledWith("download", "test.txt");
        expect(mockAppendChild).toHaveBeenCalledWith(mockFileLink);
        expect(mockFileLink.click).toHaveBeenCalled();
        expect(mockRemoveChild).toHaveBeenCalledWith(mockFileLink);
        expect(mockRevokeObjectUrl).toHaveBeenCalledWith(fakeObjectUrl);
    });
});

describe("download errors", () => {
    const setupUnsuccessfulResponse = (responseJson: object) => {
        server.use(
            rest.get(downloadFileUri, (req, res, ctx) => {
                return res(
                    ctx.status(500),
                    ctx.json(responseJson)
                );
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
});
