import { render, screen } from "@testing-library/react";
import { Artefacts } from "../../../../../app/components/contents/downloads/orderly/Artefacts";
import { mockPacket } from "../../../../mocks";
import { Artefact, PacketMetadata } from "../../../../../types";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";

const renderComponent = (packet?: PacketMetadata) => {
  render(
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<Outlet context={{ packet }} />}>
            <Route path="/" element={<Artefacts artefacts={mockPacket.custom?.orderly.artefacts as Artefact[]} />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </SWRConfig>
  );
};

describe("Artefacts component", () => {
  it("renders each artefact's description and its files' names", async () => {
    renderComponent(mockPacket);

    expect(await screen.findByText("An HTMl report")).toBeVisible();
    expect(await screen.findByText("report.html")).toBeVisible();
    expect(await screen.findByText("An artefact containing multiple files")).toBeVisible();
    expect(await screen.findByText("graph.png")).toBeVisible();
    expect(await screen.findByText("artefact_data.csv")).toBeVisible();
    expect(await screen.findByText("excel_file.xlsx")).toBeVisible();
    expect(await screen.findByText("internal_presentation.pdf")).toBeVisible();
    expect(await screen.findByText("other_extensions.txt")).toBeVisible();
  });

  it("when packet is not found it returns null", async () => {
    renderComponent();

    expect(screen.queryByText("An HTMl report")).not.toBeInTheDocument();
  });
});
