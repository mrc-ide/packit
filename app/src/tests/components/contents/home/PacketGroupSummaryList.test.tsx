import { render, screen, waitFor, within } from "@testing-library/react";
import { rest } from "msw";
import { MemoryRouter } from "react-router";
import { SWRConfig } from "swr";
import { PacketGroupSummaryList } from "@components/contents/home/PacketGroupSummaryList";
import { server } from "@/msw/server";
import { mockPacketGroupSummaries } from "../../../mocks";
import { HttpStatus } from "@lib/types/HttpStatus";
import appConfig from "@config/appConfig";
import { UserProvider } from "@components/providers/UserProvider";
import { UserState } from "@components/providers/types/UserTypes";

const mockGetUserFromLocalStorage = vitest.fn((): null | UserState => null);
vitest.mock("@lib/localStorageManager", async () => ({
  ...(await vitest.importActual("@lib/localStorageManager")),
  getUserFromLocalStorage: () => mockGetUserFromLocalStorage()
}));

const endpoint = `${appConfig.apiUrl()}/packetGroupSummaries`;

describe("PacketGroupSummaryList test", () => {
  const renderComponent = () =>
    render(
      <SWRConfig value={{ provider: () => new Map() }}>
        <MemoryRouter>
          <UserProvider>
            <PacketGroupSummaryList filterByName="" pageNumber={0} pageSize={10} setPageNumber={vitest.fn()} />
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

  it("should render correctly when no packet groups", async () => {
    server.use(
      rest.get(endpoint, (_req, res, ctx) => {
        return res(
          ctx.json({
            content: [],
            totalPages: 1,
            totalElements: 0,
            last: true,
            first: true,
            size: 50,
            number: 0,
            numberOfElements: 0
          })
        );
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/no packet groups/i)).toBeVisible();
    });
  });

  it("should render error message when error occurs fetching packet groups", async () => {
    server.use(
      rest.get(endpoint, (_req, res, ctx) => {
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
      rest.get(endpoint, (_req, res, ctx) => {
        return res(ctx.status(HttpStatus.Unauthorized));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/unauthorized/i)).toBeVisible();
    });
  });
});
