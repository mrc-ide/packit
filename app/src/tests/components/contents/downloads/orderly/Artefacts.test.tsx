import { render, screen } from "@testing-library/react";
import { Artefacts } from "../../../../../app/components/contents/downloads/orderly/Artefacts";
import { mockPacket } from "../../../../mocks";
import { Artefact } from "../../../../../types";
import { createMemoryRouter, MemoryRouter, Outlet, Route, RouterProvider, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import { PacketFileFullScreen } from "../../../../../app/components/contents/packets";

const renderComponent = () => {
  render(
    <SWRConfig value={{ dedupingInterval: 0 }}>
      <MemoryRouter initialEntries={[`/`]}>
        <Routes>
          <Route element={<Outlet context={{ packet: mockPacket }} />}>
            <Route path="/" element={<Artefacts artefacts={mockPacket.custom?.orderly.artefacts as Artefact[]} />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </SWRConfig>
  );
};

describe("Artefacts component", () => {
  it("renders each artefact's description and its files' names", async () => {
    renderComponent();

    expect(await screen.findByText("An HTMl report")).toBeVisible();
    expect(await screen.findByText("report.html")).toBeVisible();
    expect(await screen.findByText("An artefact containing multiple files")).toBeVisible();
    expect(await screen.findByText("graph.png")).toBeVisible();
    expect(await screen.findByText("artefact_data.csv")).toBeVisible();
    expect(await screen.findByText("excel_file.xlsx")).toBeVisible();
    expect(await screen.findByText("internal_presentation.pdf")).toBeVisible();
    expect(await screen.findByText("other_extensions.txt")).toBeVisible();
  });
});
