import { render, screen, waitFor } from "@testing-library/react";
import { mockPacket } from "../../../mocks";
import { Accordion } from "../../../../app/components/Base/Accordion";
import { PacketParameters } from "../../../../app/components/contents/packets/PacketParameters";

describe("PacketParameters Component", () => {
  it("renders parameters correctly", async () => {
    render(
      <Accordion type="single" defaultValue="parameters">
        <PacketParameters parameters={mockPacket.parameters as Record<string, string>} />
      </Accordion>
    );

    await waitFor(() => {
      Object.keys(mockPacket.parameters as object).forEach((key) => {
        expect(screen.getByText(`${key}:`)).toBeVisible();
      });
    });
  });
});
