import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { UpdateUserDropdownMenu } from "@components/contents/admin/manageUsersActions/UpdateUserDropdownMenu";
import userEvent from "@testing-library/user-event";

describe("UpdateUserDropdownMenu", () => {
  const DOWN_ARROW = { keyCode: 40 };

  it("should render update roles dialog on update roles click", async () => {
    render(
      <UpdateUserDropdownMenu
        mutate={vitest.fn()}
        user={{ roles: [], username: "user1", id: "1", specificPermissions: [] }}
        roles={[]}
      />
    );

    fireEvent.keyDown(await screen.findByRole("button", { name: "edit-user" }), DOWN_ARROW);

    const roleMenuItem = await screen.findByRole("menuitem", { name: /update roles/i });
    userEvent.click(roleMenuItem);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByText(/update roles on user1/i)).toBeVisible();
  });

  it("should render update permissions dialog on update permissions click", async () => {
    render(
      <UpdateUserDropdownMenu
        mutate={vitest.fn()}
        user={{ roles: [], username: "user1", id: "1", specificPermissions: [] }}
        roles={[]}
      />
    );

    fireEvent.keyDown(await screen.findByRole("button", { name: "edit-user" }), DOWN_ARROW);

    const roleMenuItem = await screen.findByRole("menuitem", { name: /update permissions/i });
    userEvent.click(roleMenuItem);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByText(/update permissions on user1/i)).toBeVisible();
  });
});
