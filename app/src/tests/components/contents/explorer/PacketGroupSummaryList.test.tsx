import { render, screen, waitFor } from "@testing-library/react";
import { rest } from "msw";
import { MemoryRouter } from "react-router";
import { SWRConfig } from "swr";
import { PacketGroupSummaryList } from "../../../../app/components/contents/explorer/PacketGroupSummaryList";
import { server } from "../../../../msw/server";
import { mockPacketGroupSummary } from "../../../mocks";

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
        expect(screen.getByRole("link", { name: packet.name })).toHaveAttribute("href", `/${packet.name}`);
        expect(screen.getAllByRole("link", { name: /latest/i })[index]).toHaveAttribute(
          "href",
          `/${packet.name}/${packet.latestId}`
        );
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
});
