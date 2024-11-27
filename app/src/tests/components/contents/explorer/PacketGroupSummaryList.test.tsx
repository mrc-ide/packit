import {render, screen, waitFor, within} from "@testing-library/react";
import { rest } from "msw";
import { MemoryRouter } from "react-router";
import { SWRConfig } from "swr";
import { PacketGroupSummaryList } from "../../../../app/components/contents/explorer/PacketGroupSummaryList";
import { server } from "../../../../msw/server";
import { mockPacketGroupSummary } from "../../../mocks";
import { HttpStatus } from "../../../../lib/types/HttpStatus";

describe("PacketList test", () => {
  const renderComponent = () =>
    render(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <MemoryRouter>
          <PacketGroupSummaryList filterByName="" pageNumber={0} pageSize={10} setPageNumber={jest.fn()} />
        </MemoryRouter>
      </SWRConfig>
    );

  it("should render list of data correctly when available & pagination showing", async () => {
    renderComponent();

    await waitFor(() => {
      mockPacketGroupSummary.content.forEach((packet, index) => {
        const listItem = screen.getAllByRole("listitem")[index];
        expect(within(listItem).getByRole("link", { name: packet.latestDisplayName })).toHaveAttribute("href", `/${packet.name}`);
        expect(within(listItem).getByRole("link", { name: /latest/i })).toHaveAttribute(
          "href",
          `/${packet.name}/${packet.latestId}`
        );
        expect(within(listItem).getByText(new RegExp(`${packet.packetCount} packet`))).toBeVisible();
        expect(within(listItem).getByText(packet.name)).toBeVisible();
      });
    });

    expect(screen.getByText(/page 1 of 1/i)).toBeVisible();
  });

  it("should render error message when error occurs", async () => {
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

  it("should render unauthorized when 401 error fetching", async () => {
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
