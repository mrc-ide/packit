import { render, screen } from "@testing-library/react";
import { OtherFiles } from "../../../../../app/components/contents/downloads/orderly/OtherFiles";
import { mockPacket } from "../../../../mocks";
import { InputFile, InputFileType, PacketMetadata } from "../../../../../types";
import { MemoryRouter, Outlet, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";

const renderComponent = (inputFiles: InputFile[] = [], packet: PacketMetadata | null = mockPacket) => {
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route element={<Outlet context={{ packet }} />}>
            <Route path="/" element={<OtherFiles inputs={inputFiles} />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </SWRConfig>
  );
};

describe("OtherFiles component", () => {
  it("renders a list of files", async () => {
    const inputs: InputFile[] = [
      { path: "report.html", role: InputFileType.Resource },
      { path: "artefact_data.csv", role: InputFileType.Resource }
    ];
    renderComponent(inputs);

    expect(await screen.findByText("report.html")).toBeVisible();
    expect(await screen.findByText("artefact_data.csv")).toBeVisible();
  });

  it("does not render 'Shared resource' text for resource files", async () => {
    const inputs: InputFile[] = [{ path: "report.html", role: InputFileType.Resource }];
    renderComponent(inputs);

    expect(await screen.findByText("report.html")).toBeVisible();
    expect(screen.queryByText("Shared resource")).not.toBeInTheDocument();
  });

  it("renders 'Shared resource' text for shared files", async () => {
    const inputs: InputFile[] = [{ path: "a_renamed_common_resource.csv", role: InputFileType.Shared }];
    renderComponent(inputs);

    expect(await screen.findByText("a_renamed_common_resource.csv")).toBeVisible();
    expect(await screen.findByText("Shared resource")).toBeVisible();
  });

  it("when packet is not found it returns null", async () => {
    renderComponent([{ path: "report.html", role: InputFileType.Resource }], null);

    expect(screen.queryByText("An HTMl report")).not.toBeInTheDocument();
  });
});
