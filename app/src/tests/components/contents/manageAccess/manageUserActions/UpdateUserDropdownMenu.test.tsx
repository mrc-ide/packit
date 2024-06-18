/* eslint-disable max-len */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { UpdateUserDropdownMenu } from "../../../../../app/components/contents/manageAccess/manageUsersActions/UpdateUserDropdownMenu";
import userEvent from "@testing-library/user-event";

describe("UpdateUserDropdownMenu", () => {
  const DOWN_ARROW = { keyCode: 40 };

  it("should render update roles dialog on update roles click", async () => {
    render(
      <UpdateUserDropdownMenu
        mutate={jest.fn()}
        user={{ roles: [], username: "user1", id: 1, specificPermissions: [] }}
        roles={[]}
      />
    );

    fireEvent.keyDown(await screen.findByRole("button", { name: "edit-user" }), DOWN_ARROW);

    const roleMenuItem = await screen.findByRole("menuitem", { name: "Update Roles" });
    userEvent.click(roleMenuItem);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByText(/update roles on user1/i)).toBeVisible();
  });

  it("should render update permissions dialog on update permissions click", async () => {
    render(
      <UpdateUserDropdownMenu
        mutate={jest.fn()}
        user={{ roles: [], username: "user1", id: 1, specificPermissions: [] }}
        roles={[]}
      />
    );

    fireEvent.keyDown(await screen.findByRole("button", { name: "edit-user" }), DOWN_ARROW);

    const roleMenuItem = await screen.findByRole("menuitem", { name: "Update Permissions" });
    userEvent.click(roleMenuItem);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByText(/update permissions on user1/i)).toBeVisible();
  });
});
