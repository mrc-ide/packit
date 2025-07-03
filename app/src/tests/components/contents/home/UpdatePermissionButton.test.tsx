import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UpdatePermissionButton } from "@components/contents/home/UpdatePermissionButton";
import { mockPacket } from "@/tests/mocks";

describe("UpdatePermissionButton", () => {
  const packetGroupName = mockPacket.name;
  it("should render dialog on button click correctly", async () => {
    render(<UpdatePermissionButton packetGroupName={packetGroupName} />);

    userEvent.click(screen.getByRole("button", { name: `manage-access-${packetGroupName}` }));

    await waitFor(() => {
      expect(screen.getByText(`update read access on ${packetGroupName}`, { exact: false })).toBeVisible();
    });
  });

  it("should be able to open and close dialog", async () => {
    render(<UpdatePermissionButton packetGroupName={packetGroupName} />);

    userEvent.click(screen.getByRole("button", { name: `manage-access-${packetGroupName}` }));

    await screen.findByText("Grant read access");

    userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByText(`update read access on ${packetGroupName}`, { exact: false })).not.toBeInTheDocument();
    });
  });
});
