import { SWRConfig } from "swr";
import { PacketTable } from "../../../../app/components/contents/PacketGroup/PacketTable";
import { render, screen, waitFor } from "@testing-library/react";
import { mockPacket, mockPacketGroupResponse } from "../../../mocks";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { server } from "../../../../msw/server";
import { rest } from "msw";
import appConfig from "../../../../config/appConfig";
import { HttpStatus } from "../../../../lib/types/HttpStatus";

const renderComponent = (parentLoading = false) =>
  render(
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <MemoryRouter initialEntries={[`/${mockPacketGroupResponse.content[0].name}`]}>
        <Routes>
          <Route path="/:packetName" element={<PacketTable parentIsLoading={parentLoading} />} />
        </Routes>
      </MemoryRouter>
    </SWRConfig>
  );
describe("Packet table", () => {
  it("should render loading skeleton when parent is loading", async () => {
    const { container } = renderComponent(true);

    expect(container.querySelector(".animate-pulse")).toBeVisible();
  });

  it("should render error component when error fetching packets", async () => {
    server.use(
      rest.get(`${appConfig.apiUrl()}/packets/${mockPacket.name}`, (req, res, ctx) => {
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
      rest.get(`${appConfig.apiUrl()}/packets/${mockPacket.name}`, (req, res, ctx) => {
        return res(ctx.status(HttpStatus.Unauthorized));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/unauthorized/i)).toBeVisible();
    });
  });

  it("should show correct icons when sorting by packet column", async () => {
    const { container } = renderComponent();

    await screen.findByRole("table");

    expect(container.querySelector(".lucide-arrow-up-down")).toBeVisible();

    userEvent.click(screen.getByRole("button", { name: /packet/i }));

    await waitFor(() => {
      expect(container.querySelector(".lucide-arrow-up")).toBeVisible();
    });

    userEvent.click(screen.getByRole("button", { name: /packet/i }));

    await waitFor(() => {
      expect(container.querySelector(".lucide-arrow-down")).toBeVisible();
    });
  });

  it("should be able to filter by packet column", async () => {
    const filterSearch = mockPacketGroupResponse.content[1].id.substring(0, 8);
    renderComponent();

    await screen.findByRole("table");

    expect(screen.getAllByRole("cell")).toHaveLength(10);

    userEvent.type(screen.getAllByPlaceholderText("Search...")[0], filterSearch);

    await waitFor(() => {
      expect(screen.getAllByRole("cell")).toHaveLength(2); // packet + parameter cell
    });
  });

  it("should be able to filter parameter value for parameter column", async () => {
    const filterSearch = mockPacketGroupResponse.content[4].parameters["b"].toLocaleString();
    renderComponent();

    await screen.findByRole("table");

    expect(screen.getAllByRole("cell")).toHaveLength(10);

    userEvent.type(screen.getAllByPlaceholderText("Search...")[1], filterSearch);

    await waitFor(() => {
      expect(screen.getAllByRole("cell")).toHaveLength(2); // packet + parameter cell
    });
  });

  it("should be able to filter parameter key for parameter column", async () => {
    const parameterValue = "a";
    renderComponent();

    await screen.findByRole("table");

    userEvent.type(screen.getAllByPlaceholderText("Search...")[1], parameterValue);

    await waitFor(() => {
      expect(screen.getAllByRole("cell")).toHaveLength(8); // 4 packets with key a parameter
    });
  });
});
