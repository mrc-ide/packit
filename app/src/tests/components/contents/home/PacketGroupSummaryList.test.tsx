import { render, screen, waitFor, within } from "@testing-library/react";
import { rest } from "msw";
import { MemoryRouter } from "react-router";
import { SWRConfig } from "swr";
import { PacketGroupSummaryList } from "../../../../app/components/contents/home/PacketGroupSummaryList";
import { server } from "../../../../msw/server";
import { mockPacketGroupSummaries, mockUserState } from "../../../mocks";
import { HttpStatus } from "../../../../lib/types/HttpStatus";
import { UserProvider } from "../../../../app/components/providers/UserProvider";
import { manageRolesIndexUri } from "../../../../msw/handlers/manageRolesHandlers";
import { UserState } from "../../../../app/components/providers/types/UserTypes";

const mockGetUserFromLocalStorage = jest.fn((): null | UserState => null);
jest.mock("../../../../lib/localStorageManager", () => ({
  ...jest.requireActual("../../../../lib/localStorageManager"),
  getUserFromLocalStorage: () => mockGetUserFromLocalStorage()
}));

describe("PacketList test", () => {
  const renderComponent = () =>
    render(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <MemoryRouter>
          <UserProvider>
            <PacketGroupSummaryList filterByName="" pageNumber={0} pageSize={10} setPageNumber={jest.fn()} />
          </UserProvider>
        </MemoryRouter>
      </SWRConfig>
    );

  it("should render list of data correctly when available & pagination showing", async () => {
    renderComponent();

    await waitFor(() => {
      mockPacketGroupSummaries.content.forEach((packetGroup, index) => {
        const listItem = screen.getAllByRole("listitem")[index];
        expect(within(listItem).getByRole("link", { name: packetGroup.latestDisplayName })).toHaveAttribute(
          "href",
          `/${packetGroup.name}`
        );
        expect(within(listItem).getByRole("link", { name: /latest/i })).toHaveAttribute(
          "href",
          `/${packetGroup.name}/${packetGroup.latestId}`
        );
        expect(within(listItem).getByText(new RegExp(`${packetGroup.packetCount} packet`))).toBeVisible();
        expect(within(listItem).getByText(packetGroup.name)).toBeVisible();
      });
    });

    expect(screen.getByText(/page 1 of 1/i)).toBeVisible();
  });

  it("should render error message when error occurs fetching packet groups", async () => {
    server.use(
      rest.get("*", (req, res, ctx) => {
        return res(ctx.status(400));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/error fetching packet groups/i)).toBeVisible();
    });
  });

  it("should render unauthorized when 401 error fetching packet groups", async () => {
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
