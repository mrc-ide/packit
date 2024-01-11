import {render, screen, waitFor} from "@testing-library/react";
import {PacketReport} from "../../../../app/components/contents/packets/PacketReport";

const mockGetFileObjectUrl = jest.fn();
jest.mock("../../../../lib/download", () => ({
        getFileObjectUrl: async (...args: any[]) => mockGetFileObjectUrl(...args)
    })
);
describe("PacketReport component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetFileObjectUrl.mockImplementation(() => "fakeObjectUrl");
    });

    const renderComponent = () => {
        const packet = {
            files: [{ path: "test.html", hash: "sha256:12345" }]
        } as any;
        render(<PacketReport packet={ packet } fileName="test.html" />);
    };

    it("gets file object url for report src", async () => {
        renderComponent();
        await waitFor(() => {
            const iframe = screen.getByTestId("report-iframe");
            expect(iframe).toBeVisible();
            expect(iframe.getAttribute("src")).toBe("fakeObjectUrl");
            expect(mockGetFileObjectUrl).toHaveBeenCalledWith(
                "http://localhost:8080/packets/file/sha256:12345?inline=true&filename=test.html", "");
        });
    });

    it("renders error component if error fetching report data", async () => {
        mockGetFileObjectUrl.mockImplementation(() => { throw new Error("test error"); });
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText(/Error loading report/i)).toBeVisible();
            expect(screen.queryByTestId("report-iframe")).not.toBeInTheDocument();
        });
    });
});
