import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PacketHeader } from "@components/contents/packets";

describe("Packet Header component", () => {
  it("renders packet header with id, name, and display name when available", async () => {
    render(
      <MemoryRouter>
        <PacketHeader packetName={"fancy"} packetId={"1234"} displayName={"Fancy packet"} />
      </MemoryRouter>
    );
    expect(await screen.findByText("1234")).toBeVisible();
    expect(await screen.findByText("fancy")).toBeVisible();
    expect(await screen.findByText("Fancy packet")).toBeVisible();
  });

  it("renders packet header with id and name, when display name blank", async () => {
    render(
      <MemoryRouter>
        <PacketHeader packetName={"fancy"} packetId={"1234"} displayName={""} />
      </MemoryRouter>
    );
    expect(await screen.findByText("1234")).toBeVisible();
    expect(await screen.findByText("fancy")).toBeVisible();
  });
});
