import { render, screen, waitFor } from "@testing-library/react";
import { rest } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import { PacketGroup } from "../../../../app/components/contents/PacketGroup";
import { server } from "../../../../msw/server";
import {
  mockPacket,
  mockPacketGroupResponse,
  mockPacketGroupSummaries,
} from "../../../mocks";
import { HttpStatus } from "../../../../lib/types/HttpStatus";
describe("PacketGroup", () => {
  const packetGroupName = mockPacketGroupSummaries.content[5].name;
  const packetGroupDisplayName = mockPacketGroupSummaries.content[5].latestDisplayName;
  const latestPacketDescription = mockPacket.custom.orderly.description.long as string;
  const renderComponent = () =>
    render(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <MemoryRouter initialEntries={[`/${packetGroupName}`]}>
          <Routes>
            <Route path="/:packetGroupName" element={<PacketGroup />} />
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );

  it("should render heading with the latest display name in the packet group", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: packetGroupDisplayName })).toBeVisible();
    });
  });

  it("should render heading with the name of the packet group", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(packetGroupName)).toBeVisible();
    });
  });

  it("should render the latest description in the packet group", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(latestPacketDescription)).toBeVisible();
    });
  });

  it("should render data table with packet group data", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeVisible();
    });

    mockPacketGroupResponse.content.forEach((packet) => {
      expect(screen.getByText(packet.id)).toHaveAttribute("href", `/${packetGroupName}/${packet.id}`);
      expect(screen.getAllByText(new Date(packet.startTime * 1000).toLocaleString())[0]).toBeVisible();
    });

    expect(screen.getByText(/none/i)).toBeVisible();
  });

  it("should render error component when error fetching packets", async () => {
    server.use(
      rest.get("*", (req, res, ctx) => {
        return res(ctx.status(400));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/error fetching/i)).toBeVisible();
    });
  });

  it("should render unauthorized when 401 error fetching packets", async () => {
    server.use(
      rest.get("*", (req, res, ctx) => {
        return res(ctx.status(HttpStatus.Unauthorized));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/unauthorized/i)).toBeVisible();
    });
  });
});
