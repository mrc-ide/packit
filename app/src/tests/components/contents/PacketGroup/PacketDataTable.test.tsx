import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { PacketDataTable } from "../../../../app/components/contents/PacketGroup/PacketDataTable";
import { mockPacketGroupResponse } from "../../../mocks";

const renderComponent = () =>
  render(
    <MemoryRouter>
      <PacketDataTable packets={mockPacketGroupResponse.content} />
    </MemoryRouter>
  );
describe("PacketDataTable component", () => {
  it("should show correct icons when sorting by packet column", async () => {
    const { container } = renderComponent();

    await screen.findByRole("table");

    expect(container.querySelector(".lucide-arrow-up-down")).toBeVisible();

    userEvent.click(screen.getByRole("button", { name: /packet/i }));

    await waitFor(() => {
      expect(container.querySelector(".lucide-arrow-up")).toBeVisible();
    });

    userEvent.click(screen.getByRole("button", { name: /packet/i }));

    await waitFor(() => {
      expect(container.querySelector(".lucide-arrow-down")).toBeVisible();
    });
  });

  it("should be able to filter by packet column", async () => {
    const mockPacket = mockPacketGroupResponse.content[1];
    const filterSearch = mockPacket.id.substring(0, 8);
    renderComponent();

    await screen.findByRole("table");

    expect(screen.getAllByRole("cell")).toHaveLength(10);

    userEvent.type(screen.getAllByPlaceholderText("Search...")[0], filterSearch);

    await waitFor(() => {
      expect(screen.getAllByRole("cell")).toHaveLength(2); // packet + parameter cell
    });
    const cells = screen.getAllByRole("cell");
    expect(cells[0].textContent).toContain(mockPacket.id);
    expect(cells[1].textContent).toBe("None");
  });

  it("should be able to filter parameter value for parameter column", async () => {
    const filterSearch = mockPacketGroupResponse.content[4].parameters["b"].toLocaleString();
    renderComponent();

    await screen.findByRole("table");

    expect(screen.getAllByRole("cell")).toHaveLength(10);

    userEvent.type(screen.getAllByPlaceholderText("Search...")[1], filterSearch);

    await waitFor(() => {
      expect(screen.getAllByRole("cell")).toHaveLength(2); // packet + parameter cell
    });
  });

  it("should be able to filter parameter key for parameter column", async () => {
    const parameterValue = "a";
    renderComponent();

    await screen.findByRole("table");

    userEvent.type(screen.getAllByPlaceholderText("Search...")[1], parameterValue);

    await waitFor(() => {
      expect(screen.getAllByRole("cell")).toHaveLength(8); // 4 packets with key a parameter
    });
  });

  it("should show correct parameter columns in parameters column dropdown", async () => {
    const DOWN_ARROW = { keyCode: 40 };
    renderComponent();

    await screen.findByRole("table");

    const toggle = await screen.findByRole("button", { name: /parameter columns/i });
    fireEvent.keyDown(toggle, DOWN_ARROW);

    await waitFor(() => {
      mockPacketGroupResponse.content
        .flatMap((packet) => Object.keys(packet.parameters))
        .forEach((key) => {
          expect(screen.getByRole("menuitemcheckbox", { name: key })).toBeVisible();
        });
    });
  });

  it("should be able to toggle parameter columns and remove from parameters column", async () => {
    const DOWN_ARROW = { keyCode: 40 };
    renderComponent();

    await screen.findByRole("table");

    const toggle = await screen.findByRole("button", { name: /parameter columns/i });
    fireEvent.keyDown(toggle, DOWN_ARROW);

    const menuItemA = await screen.findByRole("menuitemcheckbox", { name: "a" });
    userEvent.click(menuItemA);

    await waitFor(() => {
      mockPacketGroupResponse.content
        .flatMap((packet) => Object.entries(packet.parameters))
        .forEach(([key, value]) => {
          if (key === "a") {
            expect(screen.getByRole("cell", { name: value.toLocaleString() })).toBeVisible();
          }
        });
    });

    // visible parameter column removed from parameters list
    const cell1 = screen.getAllByRole("cell")[1];
    expect(cell1.textContent).not.toContain("a:");
  });

  it("should show correct icons when sorting by single parameter column", async () => {
    const DOWN_ARROW = { keyCode: 40 };
    const { container } = renderComponent();

    await screen.findByRole("table");

    const toggle = await screen.findByRole("button", { name: /parameter columns/i });
    fireEvent.keyDown(toggle, DOWN_ARROW);

    const menuItemA = await screen.findByRole("menuitemcheckbox", { name: "a" });
    userEvent.click(menuItemA);

    const headerA = await screen.findByRole("button", { name: "a" });

    userEvent.click(headerA);
    await waitFor(() => {
      expect(container.querySelector(".lucide-arrow-up")).toBeVisible();
    });

    userEvent.click(headerA);
    await waitFor(() => {
      expect(container.querySelector(".lucide-arrow-down")).toBeVisible();
    });
  });
});
