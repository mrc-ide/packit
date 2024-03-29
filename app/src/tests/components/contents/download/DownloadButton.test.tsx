import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DownloadButton from "../../../../app/components/contents/download/DownloadButton";

let errorOnDownload = false;
const mockDownload = jest.fn();
jest.mock("../../../../lib/download", () => ({
        download: async (...args: any[]) => mockDownload(...args)
    })
);

describe("DownloadButton", () => {
    const file = {
        path: "test.txt",
        size: 1024,
        hash: "fakeHash"
    };


    const renderComponent = () => {
        render(
                <DownloadButton file={ file } />
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockDownload.mockImplementation(() => {
            if (errorOnDownload) {
                throw Error("test download error");
            }
        });
        errorOnDownload = false;

    });

    it("renders as expected", () => {
        renderComponent();
        expect(screen.getByRole("button")).toHaveTextContent("test.txt");
        expect(screen.getByText("(1 kilobytes)")).toBeInTheDocument();
    });

    it("downloads file", () => {
        renderComponent();

        userEvent.click(screen.getByRole("button"));
        const url = "http://localhost:8080/packets/file/fakeHash?filename=test.txt";
        expect(mockDownload).toHaveBeenCalledWith(url, "test.txt");
    });

    it("shows download error, and resets on success", async () => {
        renderComponent();
        errorOnDownload = true;

        userEvent.click(screen.getByRole("button"));
        await waitFor(() => {
            expect(screen.queryByText("test download error")).toBeInTheDocument();
        });

        errorOnDownload = false;
        userEvent.click(screen.getByRole("button"));
        await waitFor(() => {
            expect(screen.queryByText("test download error")).not.toBeInTheDocument();
        });
    });
});
