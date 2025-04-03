import { render, screen, waitFor } from "@testing-library/react";
import { UpdatePermissionDialog } from "../../../../app/components/contents/home/UpdatePermissionDialog";
import userEvent from "@testing-library/user-event";

describe("UpdatePermissionDialog", () => {
  const packetGroupName = "test-packet-group";
  it("should render dialog on button click correctly", async () => {
    render(<UpdatePermissionDialog roles={[]} users={[]} packetGroupName="test-packet-group" mutate={jest.fn()} />);

    userEvent.click(screen.getByRole("button", { name: `manage-access-${packetGroupName}` }));

    await waitFor(() => {
      expect(screen.getByText(`update read access on ${packetGroupName}`, { exact: false })).toBeVisible();
    });
  });

  it("should be able to open and close dialog", async () => {
    render(<UpdatePermissionDialog roles={[]} users={[]} packetGroupName="test-packet-group" mutate={jest.fn()} />);

    userEvent.click(screen.getByRole("button", { name: `manage-access-${packetGroupName}` }));

    await waitFor(() => {
      expect(screen.getByText(`update read access on ${packetGroupName}`, { exact: false })).toBeVisible();
    });

    userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByText(`update read access on ${packetGroupName}`, { exact: false })).not.toBeInTheDocument();
    });
  });
});
