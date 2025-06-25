import { render, screen, waitFor } from "@testing-library/react";
import { UpdatePermissionButton } from "../../../../app/components/contents/home/UpdatePermissionButton";
import userEvent from "@testing-library/user-event";
import { mockPacketGroupDtos, mockRolesAndUsersToUpdateRead } from "../../../mocks";

describe("UpdatePermissionDialog", () => {
  const packetGroupName = mockPacketGroupDtos.content[0].name;
  const rolesAndUsersToUpdateRead = mockRolesAndUsersToUpdateRead[packetGroupName];
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

    await waitFor(() => {
      expect(screen.getByText(`update read access on ${packetGroupName}`, { exact: false })).toBeVisible();
    });

    userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByText(`update read access on ${packetGroupName}`, { exact: false })).not.toBeInTheDocument();
    });
  });
});
