import {downloadFileUri} from "../../msw/handlers/downloadFileHandlers";
import {download} from "../../lib/download";
import {mockFileBlob} from "../mocks";
import {server} from "../../msw/server";
import {rest} from "msw";

describe("download test", () => {
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

        await download(downloadFileUri, "test.txt");

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

        await expect(download(downloadFileUri, "test.txt")).rejects.toEqual(new Error("Error: test server error"));
    });

    it("throws error with default message on unsuccessful response", async () => {
        setupUnsuccessfulResponse({
            error: {
                error: "OTHER_ERROR"
            }
        });

        await expect(download(downloadFileUri, "test.txt")).rejects.toEqual(new Error("Error downloading test.txt"));
    });
});