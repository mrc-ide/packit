import { render, screen, waitFor } from "@testing-library/react";
import { rest } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import { PacketGroup } from "../../../../app/components/contents/PacketGroup";
import { server } from "../../../../msw/server";
import { mockPacket, mockPacketGroupResponse, mockPacketGroupSummaries } from "../../../mocks";
import { HttpStatus } from "../../../../lib/types/HttpStatus";
import appConfig from "../../../../config/appConfig";

describe("PacketGroup", () => {
  const packetGroupName = mockPacket.name;
  const latestPacketDescription = mockPacket.custom?.orderly.description.long as string;
  const renderComponent = (packetGroup: string = packetGroupName) =>
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <MemoryRouter initialEntries={[`/${packetGroup}`]}>
          <Routes>
            <Route path="/:packetName" element={<PacketGroup />} />
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );

  it("should render packet header with latest display name in the packet group, and name of packet group", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: mockPacket.displayName })).toBeVisible();
      expect(screen.getByText(packetGroupName)).toBeVisible();
    });
  });

  it(
    "should render heading with the name of the packet group when the display name is the same as name," +
      "and be able to cope with a null packet description",
    async () => {
      const dependsPg = mockPacketGroupSummaries.content[mockPacketGroupSummaries.content.length - 1];
      const packetGroupDisplayUrl = `${appConfig.apiUrl()}/packetGroups/${dependsPg.name}/display`;
      server.use(
        rest.get(packetGroupDisplayUrl, (req, res, ctx) => {
          return res(
            ctx.json({
              latestDisplayName: dependsPg.latestDisplayName,
              description: null
            })
          );
        })
      );
      renderComponent(dependsPg.name);

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: dependsPg.name })).toBeVisible();
      });
    }
  );

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

  it("should render error component when error fetching packet group", async () => {
    server.use(
      rest.get(`${appConfig.apiUrl()}/packetGroups/${mockPacket.name}/display`, (req, res, ctx) => {
        return res(ctx.status(400));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/error fetching packet group/i)).toBeVisible();
    });
  });

  it("should render unauthorized when 401 error fetching packet group", async () => {
    server.use(
      rest.get(`${appConfig.apiUrl()}/packetGroups/${mockPacket.name}/display`, (req, res, ctx) => {
        return res(ctx.status(HttpStatus.Unauthorized));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/unauthorized/i)).toBeVisible();
    });
  });
});
