import { render, screen } from "@testing-library/react";
import Artefacts from "../../../../app/components/contents/downloads/Artefacts";
import { mockPacket } from "../../../mocks";
import { Artefact } from "../../../../types";

describe("Artefacts component", () => {
  it("renders each artefact's description and its files' names", async () => {
    const artefacts = mockPacket.custom?.orderly.artefacts as Artefact[];
    render(<Artefacts artefacts={artefacts} packet={mockPacket} />);

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