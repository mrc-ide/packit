import { render, screen, waitFor } from "@testing-library/react";
import { UpdatePermissionDialog } from "../../../../app/components/contents/home/UpdatePermissionDialog";
import { mockPacket } from "../../../mocks";
import { server } from "../../../../msw/server";
import { rest } from "msw";
import { SWRConfig } from "swr";

describe("UpdatePermissionDialog", () => {
  const renderComponent = () =>
    render(
      <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
        <UpdatePermissionDialog packetGroupName={mockPacket.name} dialogOpen={true} setDialogOpen={jest.fn()} />
      </SWRConfig>
    );

  it("should render dialog correctly when successfully fetched roles and users", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Grant read access")).toBeVisible();
      expect(screen.getByText("Remove read access")).toBeVisible();
    });
  });

  it("should show error message when fetching roles and users fails", async () => {
    server.use(
      rest.get("*", (req, res, ctx) => {
        return res(ctx.status(404));
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Error fetching roles and users for update")).toBeVisible();
    });
  });
});
