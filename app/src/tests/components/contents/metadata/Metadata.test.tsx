import { act, render, screen } from "@testing-library/react";

import { rest } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import { Metadata } from "../../../../app/components/contents";
import { PacketLayout } from "../../../../app/components/main";
import { server } from "../../../../msw/server";
import { mockPacket } from "../../../mocks";

describe("Metadata component", () => {
  const renderComponent = () => {
    render(
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        <MemoryRouter initialEntries={[`/${mockPacket.name}/${mockPacket.id}/metadata`]}>
          <Routes>
            <Route element={<PacketLayout />} path="/:packetName/:packetId">
              <Route path="/:packetName/:packetId/metadata" element={<Metadata />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </SWRConfig>
    );
  };

  it("renders all metadata and sub-headings if metadata is present", async () => {
    renderComponent();

    expect(await screen.findByText(mockPacket.id)).toBeVisible();
    expect(screen.getByText(/timings/i)).toBeInTheDocument();
    expect(screen.getByText(/started/i)).toBeInTheDocument();
    expect(screen.getByText(/elapsed/i)).toBeInTheDocument();
    expect(screen.getByTestId("gitHeading")).toBeInTheDocument();
    expect(screen.getByText(/branch/i)).toBeInTheDocument();
    expect(screen.getByText(/commit/i)).toBeInTheDocument();
    expect(screen.getByText(/remotes/i)).toBeInTheDocument();

    act(() => screen.getByText(/platform/i).click());

    expect(screen.getByText(/os/i)).toBeInTheDocument();
    expect(screen.getByText(/system/i)).toBeInTheDocument();
    expect(screen.getByText(/language/i)).toBeInTheDocument();

    act(() => screen.getByText(/packages/i).click());

    expect(screen.getByText(/library_of_interest/i)).toBeInTheDocument();
    expect(screen.getByText(/0.1.0/i)).toBeInTheDocument();
  });

  it("does not render elapsed time when datetime has no difference", async () => {
    server.use(
      rest.get("*", (req, res, ctx) => {
        return res(
          ctx.json({
            ...mockPacket,
            time: {
              start: Date.parse("2023-07-18T12:34:56Z"),
              end: Date.parse("2023-07-18T12:34:56Z")
            }
          })
        );
      })
    );
    renderComponent();

    await screen.findByText(/started/i);

    expect(screen.queryByText("elapsed")).not.toBeInTheDocument();
  });

  it("should not render git metadata when git is not present", async () => {
    server.use(
      rest.get("*", (req, res, ctx) => {
        return res(
          ctx.json({
            ...mockPacket,
            git: null
          })
        );
      })
    );
    renderComponent();

    await screen.findByText(/started/i);

    expect(screen.queryByText(/git/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/branch/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/commit/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/remotes/i)).not.toBeInTheDocument();
  });

  it("should not render the platform/packages sections if orderly custom metadata is not present", async () => {
    server.use(
      rest.get("*", (req, res, ctx) => {
        return res(
          ctx.json({
            ...mockPacket,
            custom: null
          })
        );
      })
    );
    renderComponent();

    await screen.findByText(/started/i);

    expect(screen.queryByText(/platform/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/packages/i)).not.toBeInTheDocument();
  });

  it("should not render any fields if packet is null", async () => {
    server.use(
      rest.get("*", (req, res, ctx) => {
        return res(ctx.json(null));
      })
    );
    renderComponent();

    await screen.findByText(/metadata/i);

    expect(screen.queryByText(/timings/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/git/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/started/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/elapsed/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/branch/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/commit/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/remotes/i)).not.toBeInTheDocument();
  });
});
