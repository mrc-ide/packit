import { fireEvent, render, screen, waitFor } from "@testing-library/react";
// eslint-disable-next-line max-len
import { UpdateRoleDropDownMenu } from "../../../../../app/components/contents/manageAccess/manageRoleActions/UpdateRoleDropDownMenu";
import userEvent from "@testing-library/user-event";

describe("UpdateRoleDropDownMenu", () => {
  const DOWN_ARROW = { keyCode: 40 };
  it("should render update user dialog on update users click", async () => {
    render(<UpdateRoleDropDownMenu mutate={jest.fn()} role={{ users: [], name: "role1" } as any} users={[]} />);

    fireEvent.keyDown(await screen.findByRole("button", { name: "edit-role" }), DOWN_ARROW);

    const userMenuItem = await screen.findByRole("menuitem", { name: "Update Users" });
    userEvent.click(userMenuItem);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByText(/update users on role1 role/i)).toBeVisible();
  });

  it("should render update permissions dialog on update permissions click", async () => {
    render(<UpdateRoleDropDownMenu mutate={jest.fn()} role={{ users: [], name: "role1" } as any} users={[]} />);

    fireEvent.keyDown(await screen.findByRole("button", { name: "edit-role" }), DOWN_ARROW);

    const permissionMenuItem = await screen.findByRole("menuitem", { name: "Update Permissions" });
    userEvent.click(permissionMenuItem);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
    expect(screen.getByText(/update permissions on role1 role/i)).toBeVisible();
  });
});
