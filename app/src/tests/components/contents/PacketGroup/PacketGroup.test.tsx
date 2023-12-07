import { SWRConfig } from "swr";
import { PacketGroup } from "../../../../app/components/contents/PacketGroup";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { mockPacketGroupResponse } from "../../../mocks";
import { capitalizeFirstLetter } from "../../../../lib/string/capitalizeFirstLetter";
import { server } from "../../../../msw/server";
import { rest } from "msw";
describe("PacketGroup", () => {
  const packetGroupName = mockPacketGroupResponse.content[0].name;
  const renderComponent = () =>
    render(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <MemoryRouter initialEntries={[`/${packetGroupName}`]}>
          <Routes>
            <Route path="/:packetName" element={<PacketGroup />} />
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );

  it("should render title with packet name", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: capitalizeFirstLetter(packetGroupName) })).toBeVisible();
    });
  });

  it("should render data table with packet group data", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByRole("table")).toBeVisible();
    });

    mockPacketGroupResponse.content.forEach((packet) => {
      expect(screen.getByText(packet.id)).toHaveAttribute("href", `/${packetGroupName}/${packet.id}`);
      expect(screen.getAllByText(new Date(packet.time * 1000).toLocaleString())[0]).toBeVisible();
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
});
