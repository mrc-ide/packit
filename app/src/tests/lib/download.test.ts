import {downloadFileUri} from "../../msw/handlers/downloadFileHandlers";
import {download} from "../../lib/download";
import {mockFileBlob} from "../mocks";

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

        const url = downloadFileUri;
        await download(url, "test.txt");
        expect(mockCreateObjectUrl).toHaveBeenCalledWith(mockFileBlob);
        expect(mockFileLink.setAttribute).toHaveBeenCalledWith("download", "test.txt");
        expect(mockAppendChild).toHaveBeenCalledWith(mockFileLink);
        expect(mockFileLink.click).toHaveBeenCalled();
        expect(mockRemoveChild).toHaveBeenCalledWith(mockFileLink);
        expect(mockRevokeObjectUrl).toHaveBeenCalledWith(fakeObjectUrl);
    });
});