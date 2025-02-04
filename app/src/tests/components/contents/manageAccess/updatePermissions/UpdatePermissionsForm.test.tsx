/* eslint-disable max-len */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog } from "../../../../../app/components/Base/Dialog";
import { UpdatePermissionsForm } from "../../../../../app/components/contents/manageAccess/updatePermission/UpdatePermissionsForm";
import appConfig from "../../../../../config/appConfig";
import { constructPermissionName } from "../../../../../lib/constructPermissionName";
import { ApiError } from "../../../../../lib/errors";
import * as fetch from "../../../../../lib/fetch";
import { HttpStatus } from "../../../../../lib/types/HttpStatus";
import { mockNonUsernameRolesWithRelationships } from "../../../../mocks";

describe("UpdatePermissionsForm", () => {
  const fetchSpy = jest.spyOn(fetch, "fetcher");
  const rolePermissions = mockNonUsernameRolesWithRelationships[0].rolePermissions;
  const renderComponent = (roleName: string, mutate = jest.fn(), setOpen = jest.fn()) => {
    render(
      <Dialog>
        <UpdatePermissionsForm
          roleName={roleName}
          rolePermissions={rolePermissions}
          mutate={mutate}
          setOpen={setOpen}
        />
      </Dialog>
    );
  };

  it("set error if submit form and no update permissions added or removed", async () => {
    renderComponent("test-role");

    userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByText("You must add or remove at least one permission.")).toBeVisible();
    });
  });

  it("should call fetcher with correct params on submit", async () => {
    renderComponent("test-role");
    const allComboBox = screen.getAllByRole("combobox", { hidden: true });

    userEvent.click(allComboBox[3]);
    const permissionToRemove = await screen.findByText(constructPermissionName(rolePermissions[3]));
    userEvent.click(permissionToRemove);

    userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith({
        url: `${appConfig.apiUrl()}/roles/test-role/permissions`,
        body: {
          addPermissions: [],
          removePermissions: [
            {
              permission: rolePermissions[3].permission,
              packetId: rolePermissions[3].packet?.id
            }
          ]
        },
        method: "PUT"
      });
    });
  });

  it("should call mutate, setOpen and reset updatePermissions on successful submit", async () => {
    const mutate = jest.fn();
    const setOpen = jest.fn();
    renderComponent("test-role", mutate, setOpen);
    const allComboBox = screen.getAllByRole("combobox", { hidden: true });

    userEvent.click(allComboBox[3]);
    const permissionToRemove = await screen.findByText(constructPermissionName(rolePermissions[3]));
    userEvent.click(permissionToRemove);

    userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalled();
    });
    expect(setOpen).toHaveBeenCalledWith(false);
    expect(fetchSpy).toHaveBeenCalled();
    expect(screen.queryByText(constructPermissionName(rolePermissions[3]))).not.toBeInTheDocument();
  });

  it("should not allow duplicate adding of addPermissions", async () => {
    renderComponent("test-role");

    const addSelect = screen.getAllByRole("combobox", { hidden: true })[1];
    userEvent.selectOptions(addSelect, "user.manage");

    const addButton = await screen.findAllByRole("button");

    userEvent.click(addButton[0]);

    await waitFor(() => {
      expect(screen.queryAllByTestId("update-badge-user.manage").length).toBe(0);
    });
  });

  it("should show api error message if fetcher throws ApiError", async () => {
    const errorMessage = "permission already exists";
    const apiError = new ApiError(errorMessage, HttpStatus.BadRequest);
    fetchSpy.mockImplementation(() => Promise.reject(apiError));

    renderComponent("test-role");
    const allComboBox = screen.getAllByRole("combobox", { hidden: true });

    userEvent.click(allComboBox[3]);
    const permissionToRemove = await screen.findByText(constructPermissionName(rolePermissions[3]));
    userEvent.click(permissionToRemove);

    userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeVisible();
    });
  });

  it("should show error message if unexpected error", async () => {
    const errorMessage = "Unexpected error";
    fetchSpy.mockImplementation(() => Promise.reject(new Error(errorMessage)));

    renderComponent("test-role");
    const allComboBox = screen.getAllByRole("combobox", { hidden: true });

    userEvent.click(allComboBox[3]);
    const permissionToRemove = await screen.findByText(constructPermissionName(rolePermissions[3]));
    userEvent.click(permissionToRemove);

    userEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(screen.getByText("An unexpected error occurred. Please try again.")).toBeVisible();
    });
  });

  it("should reset updatePermissions on cancel", async () => {
    renderComponent("test-role");
    const allComboBox = screen.getAllByRole("combobox", { hidden: true });

    userEvent.click(allComboBox[3]);
    const permissionToRemove = await screen.findByText(constructPermissionName(rolePermissions[3]));
    userEvent.click(permissionToRemove);

    userEvent.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByText(constructPermissionName(rolePermissions[3]))).not.toBeInTheDocument();
    });
  });
});
