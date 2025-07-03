import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { UpdateRoleDropDownMenu } from "@components/contents/manageAccess/manageRoleActions/UpdateRoleDropDownMenu";
import userEvent from "@testing-library/user-event";

describe("UpdateRoleDropDownMenu", () => {
  const DOWN_ARROW = { keyCode: 40 };
  it("should render update user dialog on update users click", async () => {
    render(
      <UpdateRoleDropDownMenu
        mutate={vitest.fn()}
        role={{ users: [], name: "role1", rolePermissions: [], id: 2, isUsername: false }}
        users={[]}
      />
    );

    fireEvent.keyDown(await screen.findByRole("button", { name: "edit-role" }), DOWN_ARROW);

    const userMenuItem = await screen.findByRole("menuitem", { name: /update users/i });
    userEvent.click(userMenuItem);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByText(/update users on role1/i)).toBeVisible();
  });

  it("should render update permissions dialog on update permissions click", async () => {
    render(
      <UpdateRoleDropDownMenu
        mutate={vitest.fn()}
        role={{ users: [], name: "role1", rolePermissions: [], id: 2, isUsername: false }}
        users={[]}
      />
    );

    fireEvent.keyDown(await screen.findByRole("button", { name: "edit-role" }), DOWN_ARROW);

    const permissionMenuItem = await screen.findByRole("menuitem", { name: /update permissions/i });
    userEvent.click(permissionMenuItem);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByText(/update permissions on role1/i)).toBeVisible();
  });
});
