import { render, screen, waitFor } from "@testing-library/react";
import { PacketRun } from "../../../../app/components/contents/runner";
import { mockGitBranches } from "../../../mocks";
import { server } from "../../../../msw/server";
import { rest } from "msw";
import { SWRConfig } from "swr";

describe("Packet Run component", () => {
  const renderComponent = () =>
    render(
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        <PacketRun />
      </SWRConfig>
    );
  it("should render run page with form", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Branch")).toBeVisible();
    });
    const select = screen.getByRole("combobox");
    expect(select).toHaveTextContent(mockGitBranches.defaultBranch);
  });

  it("should not render error message & not render form when fetching branches fails", async () => {
    server.use(
      rest.get("*", (req, res, ctx) => {
        return res(ctx.status(400));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Error fetching branch information")).toBeVisible();
    });
    expect(screen.queryByText("Branch")).not.toBeInTheDocument();
  });
});
