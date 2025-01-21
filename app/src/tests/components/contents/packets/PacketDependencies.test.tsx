import { render, screen } from "@testing-library/react";
import { Accordion } from "../../../../app/components/Base/Accordion";
import { PacketDependencies } from "../../../../app/components/contents/packets/PacketDependencies";
import { PacketDepends } from "../../../../types";
import { MemoryRouter } from "react-router-dom";

const renderComponent = (dependencies: PacketDepends[] = []) =>
  render(
    <MemoryRouter>
      <Accordion type="single" defaultValue="dependencies">
        <PacketDependencies depends={dependencies} />
      </Accordion>
    </MemoryRouter>
  );
describe("PacketDependencies Component", () => {
  it("should render none if no dependencies", async () => {
    renderComponent();

    expect(screen.getByText(/Dependencies/)).toBeVisible();
    expect(screen.getByText(/This packet has no dependencies on other packets/)).toBeVisible();
  });

  it("should render list of packet names with link to packets", async () => {
    const depends: PacketDepends[] = [
      { packet: "packet1", query: 'single(id == "packet69" && name == "name1")', files: [] },
      { packet: "packet2", query: 'latest(name == "name2")', files: [] }
    ];

    renderComponent(depends);

    expect(screen.getByText(/name1/)).toBeVisible();
    expect(screen.getByText(/name2/)).toBeVisible();

    const packet1Link = screen.getByRole("link", { name: /packet1/ });
    const packet2Link = screen.getByRole("link", { name: /packet2/ });
    expect(packet1Link).toHaveAttribute("href", "/name1/packet1");
    expect(packet2Link).toHaveAttribute("href", "/name2/packet2");
  });
});
