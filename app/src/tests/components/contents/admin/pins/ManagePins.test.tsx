import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { server } from "@/msw/server";
import { rest } from "msw";
import { ManagePins } from "@components/contents/admin/pins/ManagePins";
import * as UserProviderModule from "@components/providers/UserProvider";
import { mockPacket, mockPacket2 } from "@/tests/mocks";
import appConfig from "@config/appConfig";
import { SWRConfig } from "swr";

const mockUseUser = vitest.spyOn(UserProviderModule, "useUser");
const renderComponent = () => {
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter>
        <UserProviderModule.UserProvider>
          <ManagePins />
        </UserProviderModule.UserProvider>
      </MemoryRouter>
    </SWRConfig>
  );
};

describe("manage pins page", () => {
  afterEach(() => {
    vitest.clearAllMocks();
  });

  it("should render a list of the currently pinned packets", async () => {
    mockUseUser.mockReturnValue({
      authorities: ["packet.manage"]
    } as any);
    server.use(
      rest.get(`${appConfig.apiUrl()}/pins/packets`, (req, res, ctx) => {
        return res(ctx.json([mockPacket, mockPacket2]));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/current pins/i)).toBeVisible();
    });
    const packet1Link = screen.getByRole("link", { name: "A packet with parameters and a report" });
    expect(packet1Link).toHaveAttribute("href", `/${mockPacket.name}/${mockPacket.id}`);
    expect(screen.getByText("(parameters)")).toBeVisible();
    expect(screen.getByText(mockPacket.id)).toBeVisible();

    const packet2Link = screen.getByRole("link", { name: "A different packet display name" });
    expect(packet2Link).toHaveAttribute("href", `/${mockPacket2.name}/${mockPacket2.id}`);
    expect(screen.getByText("(aDifferentPacketName)")).toBeVisible();
    expect(screen.getByText(mockPacket2.id)).toBeInTheDocument();

    expect(screen.getAllByText(/Ran \d*\sdays ago/)).toHaveLength(2);
  });

  it("should render correctly when there are no pinned packets", async () => {
    mockUseUser.mockReturnValue({
      authorities: ["packet.manage"]
    } as any);
    server.use(
      rest.get(`${appConfig.apiUrl()}/pins/packets`, (req, res, ctx) => {
        return res(ctx.json([]));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/no pinned packets/i)).toBeInTheDocument();
      expect(screen.queryByText(/current pins/i)).not.toBeInTheDocument();
    });
  });

  it("shows unauthorized when user does not have user manage permission", async () => {
    mockUseUser.mockReturnValue({
      authorities: ["packet.read"]
    } as any);
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/You do not have permission to access this page/)).toBeInTheDocument();
    });
  });
});
