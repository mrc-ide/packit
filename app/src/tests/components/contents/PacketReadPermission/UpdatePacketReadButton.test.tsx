import { render, screen, waitFor } from "@testing-library/react";
// eslint-disable-next-line max-len
import { UpdatePacketReadButton } from "../../../../app/components/contents/PacketReadPermission/UpdatePacketReadButton";
import { PacketMetadata } from "../../../../types";
import userEvent from "@testing-library/user-event";

describe("UpdatePacketReadButton", () => {
  const packet = {
    name: "test-packet",
    id: "test-packet-id"
  } as PacketMetadata;
  // TODO: fix tets
  it("should render dialog on button click correctly", async () => {
    render(
      <UpdatePacketReadButton
        rolesAndUsersCantRead={{} as any}
        rolesAndUsersWithRead={{} as any}
        packet={packet}
        mutate={jest.fn()}
      />
    );

    userEvent.click(screen.getByRole("button", { name: "Update read access" }));

    await waitFor(() => {
      expect(screen.getByText(`update read access on ${packet.name}`, { exact: false })).toBeVisible();
    });
  });

  it("should be able to open and close dialog", async () => {
    render(
      <UpdatePacketReadButton
        rolesAndUsersCantRead={{} as any}
        rolesAndUsersWithRead={{} as any}
        packet={packet}
        mutate={jest.fn()}
      />
    );

    userEvent.click(screen.getByRole("button", { name: "Update read access" }));

    await waitFor(() => {
      expect(screen.getByText(`update read access on ${packet.name}`, { exact: false })).toBeVisible();
    });

    userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByText(`update read access on ${packet.name}`, { exact: false })).not.toBeInTheDocument();
    });
  });
});
