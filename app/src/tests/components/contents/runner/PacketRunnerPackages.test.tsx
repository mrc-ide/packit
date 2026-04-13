import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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

  it("should render packages page with accordion sections for library and other packages", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Package versions")).toBeVisible();
    });

    expect(screen.getByText("Runner packages")).toBeVisible();
    expect(screen.getByText("Other packages")).toBeVisible();

    const libraryPackages = mockRunnerPackages.filter((pkg) => pkg.location === "/library");
    const otherPackages = mockRunnerPackages.filter((pkg) => pkg.location !== "/library");
    libraryPackages.forEach((pkg) => {
      expect(screen.getByText(pkg.name)).toBeVisible();
      expect(screen.getByText(pkg.version)).toBeVisible();
    });
    otherPackages.forEach((pkg) => {
      expect(screen.queryByText(pkg.name)).not.toBeInTheDocument();
      expect(screen.queryByText(pkg.version)).not.toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Other packages"));

    await waitFor(() => {
      otherPackages.forEach((pkg) => {
        expect(screen.getByText(pkg.name)).toBeVisible();
        expect(screen.getByText(pkg.version)).toBeVisible();
      });
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
