import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rest } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import { Downloads, Metadata } from "../../../app/components/contents";
import { PacketDetails } from "../../../app/components/contents/packets";
import { PacketLayout } from "../../../app/components/main";
import { server } from "../../../msw/server";
import { mockPacket } from "../../mocks";
import { HttpStatus } from "../../../lib/types/HttpStatus";

jest.mock("../../../lib/download", () => ({
  ...jest.requireActual("../../../lib/download"),
  getFileObjectUrl: async () => "fakeObjectUrl"
}));

describe("Packet Layout test", () => {
  const renderComponent = () => {
    render(
      <SWRConfig value={{ dedupingInterval: 0 }}>
        <MemoryRouter initialEntries={[`/${mockPacket.name}/${mockPacket.id}`]}>
          <Routes>
            <Route element={<PacketLayout />} path="/:packetName/:packetId">
              <Route path="/:packetName/:packetId" element={<PacketDetails />} />
              <Route path="/:packetName/:packetId/metadata" element={<Metadata />} />
              <Route path="/:packetName/:packetId/downloads" element={<Downloads />} />
              {/* <Route path="/:packetName/:packetId/changelogs" element={<ChangeLogs />} /> */}
            </Route>
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );
  };

  it("should show sidebar components and able to go through pages", async () => {
    renderComponent();

    expect(await screen.findByText(/fullscreen/i)).toBeVisible();

    userEvent.click(screen.getByRole("link", { name: /metadata/i }));

    expect(await screen.findByText(/branch/i)).toBeVisible();

    userEvent.click(screen.getByRole("link", { name: /downloads/i }));

    expect((await screen.findAllByText(/downloads/i))[0]).toBeVisible();
  });

  it("should render error component and sidebar when error fetching packet", async () => {
    server.use(
      rest.get("*", (req, res, ctx) => {
        return res(ctx.status(400));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/error fetching/i)).toBeVisible();
    });
    expect(screen.getByRole("link", { name: /metadata/i })).toBeVisible();
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
