import {render, screen, waitFor} from "@testing-library/react";
import {MemoryRouter, Route, Routes} from "react-router-dom";
import {mockPacket} from "../../../mocks";
import {PacketFileFullScreen} from "../../../../app/components/contents/packets/PacketFileFullScreen";
import {server} from "../../../../msw/server";
import {rest} from "msw";
import appConfig from "../../../../config/appConfig";
import {SWRConfig} from "swr";

jest.mock("../../../../lib/download", () => ({
        getFileObjectUrl: async () => "testFileObjectUrl"
    })
);
describe("PacketFileFullScreen", () => {
    const renderComponent = () => {
        render(
            <SWRConfig value={{ dedupingInterval: 0 }}>
                <MemoryRouter initialEntries={[`/${mockPacket.name}/${mockPacket.id}/file/report.html`]}>
                    <Routes>
                        <Route path="/:packetName/:packetId/file/:fileName" element={<PacketFileFullScreen />} />
                    </Routes>
                </MemoryRouter>
            </SWRConfig>
        );
    };

    it("gets packet and renders PacketReport", async () => {
        renderComponent();
        await waitFor(() => {
            expect(screen.getByTestId("report-iframe").getAttribute("src")).toBe("testFileObjectUrl");
        });
    });

    it("renders error if packet data cannot be fetched", async () => {
        server.use(
            rest.get(`${appConfig.apiUrl()}/packets/metadata/${mockPacket.id}`, (req, res, ctx) => {
                return res(
                    ctx.status(500),
                    ctx.json({
                        error: {
                            error: "OTHER_ERROR",
                            detail: "test server error"
                        }
                    })
                );
            })
        );
        renderComponent();
        await waitFor(() => {
            expect(screen.getByText(/Please try again later./i)).toBeInTheDocument();
            expect(screen.queryByTestId("report-iframe")).not.toBeInTheDocument();
        });
    });
});