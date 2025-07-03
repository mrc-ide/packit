import { render, screen } from "@testing-library/react";
import { Accordion } from "@components/Base/Accordion";
import { PacketDependencies } from "@components/contents/packets/PacketDependencies";
import { BasicPacket, PacketDepends } from "@/types";
import { MemoryRouter } from "react-router-dom";
import { mockPackets } from "@/tests/mocks";

const renderComponent = (depends: PacketDepends[]) =>
  render(
    <MemoryRouter>
      <Accordion type="single" defaultValue="dependencies">
        <PacketDependencies depends={depends} />
      </Accordion>
    </MemoryRouter>
  );

describe("PacketDependencies Component", () => {
  it("should render helpful message if no dependencies", async () => {
    renderComponent([]);

    expect(await screen.findByText(/Dependencies/)).toBeVisible();
    expect(await screen.findByText(/None/)).toBeVisible();
  });

  it("should render list of packet names with link to packets", async () => {
    const depends: PacketDepends[] = mockPackets.map((packet) => ({
      packet: packet.id,
      query: "mock query",
      files: []
    }));

    renderComponent(depends);

    mockPackets.forEach(async (packet: BasicPacket) => {
      expect(await screen.findByText(packet.id)).toBeVisible();
      const packetLink = await screen.findByRole("link", { name: packet.id });
      expect(packetLink).toHaveAttribute("href", `/${packet.name}/${packet.id}`);
    });
  });
});
