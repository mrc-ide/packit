import {downloadFileUri} from "../../msw/handlers/downloadFileHandlers";
import {download} from "../../lib/download";
import {mockFileBlob} from "../mocks";

describe("download test", () => {
    const fakeObjectUrl = "fakeObjectUrl";
    const mockCreateObjectUrl = jest.fn().mockImplementation(() => fakeObjectUrl);
    const mockRevokeObjectUrl = jest.fn();

    window.URL.createObjectURL = mockCreateObjectUrl;
    window.URL.revokeObjectURL = mockRevokeObjectUrl;

    const mockElement = {
        href: "",
        setAttribute: jest.fn()
    } as any;
    const spyCreateElement = jest.spyOn(document, "createElement")
        .mockImplementation(() => {
            console.log("calling mock")
            return mockElement;
        });

    beforeEach(() => {
       // jest.clearAllMocks();
    });

    it("downloads on successful response", async () => {
        const url = downloadFileUri;
        await download(url, "test.txt");
        expect(mockCreateObjectUrl).toHaveBeenCalledWith(mockFileBlob);
        expect(spyCreateElement).toHaveBeenCalledWith("a");
    });
});