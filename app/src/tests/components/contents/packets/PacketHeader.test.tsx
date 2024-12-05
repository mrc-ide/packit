import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {PacketHeader} from "../../../../app/components/contents/packets";

describe("Packet Header component", () => {
  it("renders packet header with id, name, and display name when available", async () => {
    render(
      <MemoryRouter>
        <PacketHeader displayName={"Fancy packet"} packetName={"fancy"} packetId={"1234"} />
      </MemoryRouter>
    );
    expect(await screen.findByText("1234")).toBeVisible();
    expect(await screen.findByText("fancy")).toBeVisible();
    expect(await screen.findByText("Fancy packet")).toBeVisible();
  });

  it("renders packet header with id and name, when display name blank", async () => {
    render(
      <MemoryRouter>
        <PacketHeader displayName={""} packetName={"fancy"} packetId={"1234"} />
      </MemoryRouter>
    );
    expect(await screen.findByText("1234")).toBeVisible();
    expect(await screen.findByText("fancy")).toBeVisible();
  });
});
