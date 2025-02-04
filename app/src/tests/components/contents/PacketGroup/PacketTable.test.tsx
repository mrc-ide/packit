import { render, screen, waitFor } from "@testing-library/react";
import { rest } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import { PacketTable } from "../../../../app/components/contents/PacketGroup/PacketTable";
import appConfig from "../../../../config/appConfig";
import { HttpStatus } from "../../../../lib/types/HttpStatus";
import { server } from "../../../../msw/server";
import { mockPacket, mockPacketGroupResponse } from "../../../mocks";

const renderComponent = (parentLoading = false) =>
  render(
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <MemoryRouter initialEntries={[`/${mockPacketGroupResponse.content[0].name}`]}>
        <Routes>
          <Route path="/:packetName" element={<PacketTable parentIsLoading={parentLoading} />} />
        </Routes>
      </MemoryRouter>
    </SWRConfig>
  );
describe("Packet table", () => {
  it("should render loading skeleton when parent is loading", async () => {
    const { container } = renderComponent(true);

    expect(container.querySelector(".animate-pulse")).toBeVisible();
  });

  it("should render error component when error fetching packets", async () => {
    server.use(
      rest.get(`${appConfig.apiUrl()}/packetGroups/${mockPacket.name}/packets`, (req, res, ctx) => {
        return res(ctx.status(400));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/error fetching packets/i)).toBeVisible();
    });
  });

  it("should render unauthorized when 401 error fetching packets", async () => {
    server.use(
      rest.get(`${appConfig.apiUrl()}/packetGroups/${mockPacket.name}/packets`, (req, res, ctx) => {
        return res(ctx.status(HttpStatus.Unauthorized));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/unauthorized/i)).toBeVisible();
    });
  });
});
