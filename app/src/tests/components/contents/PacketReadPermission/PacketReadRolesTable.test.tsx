import { render, screen, waitFor } from "@testing-library/react";
import { RoleWithRelationships } from "@components/contents/manageAccess/types/RoleWithRelationships";
import { PacketReadRolesTable } from "@components/contents/PacketReadPermission/PacketReadRolesTable";
import userEvent from "@testing-library/user-event";

describe("PacketReadRolesTable", () => {
  const roles = [
    { name: "role1", users: [{ username: "user1", id: 1 }] },
    {
      name: "role2",
      users: [
        { username: "user2", id: 2 },
        { username: "user3", id: 3 }
      ]
    },
    { name: "role3", users: [] }
  ] as unknown as RoleWithRelationships[];

  it("should render roles table correctly", async () => {
    render(<PacketReadRolesTable roles={roles} />);

    roles.forEach((role) => {
      expect(screen.getByText(role.name)).toBeVisible();
      role.users.forEach((user) => {
        expect(screen.getByText(new RegExp(user.username))).toBeVisible();
      });
    });
  });

  it("should be able to global filter roles", async () => {
    render(<PacketReadRolesTable roles={roles} />);

    userEvent.type(screen.getByPlaceholderText(/search/i), "user3");

    await waitFor(() => {
      expect(screen.queryByText(/user1/i)).not.toBeInTheDocument();
    });
    expect(screen.queryByText(/role1/i)).not.toBeInTheDocument();
    expect(screen.getByText(/role2/i)).toBeVisible();
    expect(screen.getByText(/user3/i)).toBeVisible();
    expect(screen.getByText(/user2/i)).toBeVisible();
  });
});
