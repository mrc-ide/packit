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
  mockPacketGroupSummariesFiltered,
} from "../../../mocks";
import { HttpStatus } from "../../../../lib/types/HttpStatus";
import appConfig from "../../../../config/appConfig";
describe("PacketGroup", () => {
  const packetGroupName = mockPacketGroupSummaries.content[5].name;
  const packetGroupDisplayName = mockPacketGroupSummaries.content[5].latestDisplayName;
  const latestPacketDescription = mockPacket.custom?.orderly.description.long as string;
  const renderComponent = (packetGroup: string = packetGroupName) =>
    render(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <MemoryRouter initialEntries={[`/${packetGroup}`]}>
          <Routes>
            <Route path="/:packetGroupName" element={<PacketGroup />} />
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );

  it("should render packet header with the latest display name in the packet group, and the name of the packet group", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: packetGroupDisplayName })).toBeVisible();
      expect(screen.getByText(packetGroupName)).toBeVisible();
    });
  });

  it("should render heading with the name of the packet group when the display name is the same as the name", async () => {
    const groupName = mockPacketGroupSummaries.content[mockPacketGroupSummaries.content.length - 1].name
    const mockGroupSummariesResponse = {
      ...mockPacketGroupSummariesFiltered,
      content: [
        {
          ...mockPacketGroupSummariesFiltered.content[0],
          name: groupName,
          latestDisplayName: groupName,
        }
      ]
    }
    server.use(
      rest.get(`${appConfig.apiUrl()}/packets/packetGroupSummaries`, (req, res, ctx) => {
        return res(ctx.json(mockGroupSummariesResponse));
      })
    );
    renderComponent(groupName);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: groupName })).toBeVisible();
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

  it("should render error component when error fetching latest packet", async () => {
    server.use(
      rest.get(`${appConfig.apiUrl()}/packets/metadata/*`, (req, res, ctx) => {
        return res(ctx.status(400));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/error fetching packet/i)).toBeVisible();
    });
  });

  it("should render error component when error fetching latest packet", async () => {
    server.use(
      rest.get(`${appConfig.apiUrl()}/packets/metadata/*`, (req, res, ctx) => {
        return res(ctx.status(400));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/error fetching packet/i)).toBeVisible();
    });
  });

  it("should render error component when error fetching packet group", async () => {
    server.use(
      rest.get(`${appConfig.apiUrl()}/packets/packetGroupSummaries`, (req, res, ctx) => {
        return res(ctx.status(400));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/error fetching packet group/i)).toBeVisible();
    });
  });

  it("should render error component when error fetching packet group", async () => {
    server.use(
      rest.get(`${appConfig.apiUrl()}/packets/${packetGroupName}`, (req, res, ctx) => {
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
      rest.get(`${appConfig.apiUrl()}/packets/metadata/*`, (req, res, ctx) => {
        return res(ctx.status(HttpStatus.Unauthorized));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/unauthorized/i)).toBeVisible();
    });
  });

  it("should render unauthorized when 401 error fetching packet group", async () => {
    server.use(
      rest.get(`${appConfig.apiUrl()}/packets/packetGroupSummaries`, (req, res, ctx) => {
        return res(ctx.status(HttpStatus.Unauthorized));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/unauthorized/i)).toBeVisible();
    });
  });
});
