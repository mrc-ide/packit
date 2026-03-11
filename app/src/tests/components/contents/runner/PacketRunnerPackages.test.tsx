import { render, screen, waitFor } from "@testing-library/react";
import { PacketRunnerPackages } from "@components/contents/runner";
import { mockRunnerPackages } from "@/tests/mocks";
import { SWRConfig } from "swr";
import { MemoryRouter } from "react-router-dom";
import { server } from "@/msw/server";
import { rest } from "msw";
import { HttpStatus } from "@lib/types/HttpStatus";
import { basicRunnerUri } from "@/msw/handlers/runnerHandlers";

describe("PacketRunnerPackages component", () => {
  const renderComponent = () =>
    render(
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        <MemoryRouter>
          <PacketRunnerPackages />
        </MemoryRouter>
      </SWRConfig>
    );

  it("should render packages page with a list of installed packages", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Packages")).toBeVisible();
    });

    expect(screen.getByText(`Installed packages (${mockRunnerPackages.length})`)).toBeVisible();
    mockRunnerPackages.forEach((pkg) => {
      expect(screen.getByText(pkg.name)).toBeVisible();
      expect(screen.getByText(pkg.version)).toBeVisible();
    });
  });

  it("should render unauthorized when 401 error fetching packages", async () => {
    server.use(
      rest.get(`${basicRunnerUri}/packages`, (_req, res, ctx) => {
        return res(ctx.status(HttpStatus.Unauthorized));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/unauthorized/i)).toBeVisible();
    });
  });

  it("should render error component when non-401 error fetching packages", async () => {
    server.use(
      rest.get(`${basicRunnerUri}/packages`, (_req, res, ctx) => {
        return res(ctx.status(400));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/error fetching data/i)).toBeVisible();
    });
  });
});
