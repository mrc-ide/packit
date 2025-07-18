import { render, screen } from "@testing-library/react";
import { PacketReadUsersList } from "@components/contents/PacketReadPermission/PacketReadUsersList";
import { UserWithPermissions } from "@components/contents/admin/types/UserWithPermissions";

describe("PacketReadUsersList", () => {
  it("should render users with read access", () => {
    const users = [
      { id: "user1", username: "user1" },
      { id: "user2", username: "user2" }
    ] as unknown as UserWithPermissions[];

    render(<PacketReadUsersList users={users} />);

    expect(screen.getByText(/Specific users with read access/i)).toBeVisible();
    expect(screen.getByText(/users granted access on an individual basis/i)).toBeVisible();
    users.forEach((user) => {
      expect(screen.getByText(user.username)).toBeVisible();
    });
  });

  it("should render none when no users in list", async () => {
    const users: UserWithPermissions[] = [];

    render(<PacketReadUsersList users={users} />);

    expect(screen.getByText(/none/i)).toBeVisible();
  });
});
