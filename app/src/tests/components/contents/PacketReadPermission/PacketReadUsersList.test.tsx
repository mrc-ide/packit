import { render, screen } from "@testing-library/react";
import { PacketReadUsersList } from "../../../../app/components/contents/PacketReadPermission/PacketReadUsersList";
import { UserWithRoles } from "../../../../app/components/contents/manageAccess/types/UserWithRoles";

describe("PacketReadUsersList", () => {
  it("should render users with read access", () => {
    const users = [
      { id: "user1", username: "user1" },
      { id: "user2", username: "user2" }
    ] as unknown as UserWithRoles[];

    render(<PacketReadUsersList users={users} />);

    expect(screen.getByText(/specific users with read access/i)).toBeVisible();
    expect(screen.getByText(/users granted access on an individual basis/i)).toBeVisible();
    users.forEach((user) => {
      expect(screen.getByText(user.username)).toBeVisible();
    });
  });
});
