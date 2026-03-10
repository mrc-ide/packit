import { render, screen, waitFor } from "@testing-library/react";
import { PacketRunPackages } from "@components/contents/runner";
import { mockRunnerPackages } from "@/tests/mocks";
import { SWRConfig } from "swr";
import { MemoryRouter } from "react-router-dom";

describe("Packet Run component", () => {
  const renderComponent = () =>
    render(
      <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
        <MemoryRouter>
          <PacketRunPackages />
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
});
