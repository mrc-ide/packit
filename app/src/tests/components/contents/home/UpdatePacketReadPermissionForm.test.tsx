import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog } from "../../../../app/components/Base/Dialog";
import * as fetch from "../../../../lib/fetch";
// eslint-disable-next-line max-len
import { UpdatePacketReadPermissionForm } from "../../../../app/components/contents/home/UpdatePacketReadPermissionForm";
import appConfig from "../../../../config/appConfig";
import { ApiError } from "../../../../lib/errors";
import { HttpStatus } from "../../../../lib/types/HttpStatus";
import { mockRolesAndUsersWithPermissions } from "../../../mocks";

describe("UpdatePacketReadPermissionForm", () => {
  const fetcherSpy = jest.spyOn(fetch, "fetcher");
  const packetGroupName = "explicit";
  const mutate = jest.fn();
  const setDialogOpen = jest.fn();
  const renderComponent = (packetId?: string) => {
    const [canRead, withRead] = [
      {
        roles: mockRolesAndUsersWithPermissions.roles.slice(0, 1),
        users: mockRolesAndUsersWithPermissions.users.slice(0, 1)
      },
      {
        roles: mockRolesAndUsersWithPermissions.roles.slice(1, 2),
        users: mockRolesAndUsersWithPermissions.users.slice(1, 2)
      }
    ];
    return render(
      <Dialog>
        <UpdatePacketReadPermissionForm
          mutate={mutate}
          packetGroupName={packetGroupName}
          rolesAndUsersWithRead={canRead}
          rolesAndUsersCannotRead={withRead}
          setDialogOpen={setDialogOpen}
          packetId={packetId}
        />
      </Dialog>
    );
  };

  const submitValidForm = async () => {
    const multiSelects = screen.getAllByRole("combobox");

    userEvent.click(multiSelects[0]); // grant read access
    const addOptions = await screen.findAllByRole("option");
    expect(addOptions).toHaveLength(2);
    expect(addOptions[0]).toHaveTextContent(mockRolesAndUsersWithPermissions.roles[1].name);
    expect(addOptions[1]).toHaveTextContent(mockRolesAndUsersWithPermissions.users[1].username);
    userEvent.click(addOptions[0]);

    userEvent.click(multiSelects[1]); // remove read access
    const removeOptions = await screen.findAllByRole("option");
    expect(removeOptions).toHaveLength(2);
    expect(removeOptions[0]).toHaveTextContent(mockRolesAndUsersWithPermissions.roles[0].name);
    expect(removeOptions[1]).toHaveTextContent(mockRolesAndUsersWithPermissions.users[0].username);
    userEvent.click(removeOptions[0]);

    await waitFor(() => {
      expect(addOptions[0]).not.toBeVisible();
    });

    userEvent.click(screen.getByRole("button", { name: /save/i }));
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call correct functions when form is submitted successfully with correct url", async () => {
    renderComponent();

    await submitValidForm();

    await waitFor(() => {
      expect(fetcherSpy).toHaveBeenCalledWith({
        url: `${appConfig.apiUrl()}/packetGroups/${packetGroupName}/read-permission`,
        method: "PUT",
        body: {
          roleNamesToAdd: [mockRolesAndUsersWithPermissions.roles[1].name],
          roleNamesToRemove: [mockRolesAndUsersWithPermissions.roles[0].name]
        }
      });
      expect(mutate).toHaveBeenCalled();
      expect(setDialogOpen).toHaveBeenCalledWith(false);
    });
  });

  it("should call correct functions when form is submitted successfully with  packetId", async () => {
    const packetId = "1234";
    renderComponent(packetId);

    await submitValidForm();

    await waitFor(() => {
      expect(fetcherSpy).toHaveBeenCalledWith({
        url: `${appConfig.apiUrl()}/packets/${packetId}/read-permission`,
        method: "PUT",
        body: {
          roleNamesToAdd: [mockRolesAndUsersWithPermissions.roles[1].name],
          roleNamesToRemove: [mockRolesAndUsersWithPermissions.roles[0].name]
        }
      });
      expect(mutate).toHaveBeenCalled();
      expect(setDialogOpen).toHaveBeenCalledWith(false);
    });
  });

  it("should show error message when form submitted with no roles are selected", async () => {
    renderComponent();

    userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/you must add or remove at least one role or user/i)).toBeVisible();
    });
  });

  it("should show error message when form submission fails", async () => {
    const apiError = new ApiError("error with submission", HttpStatus.BadRequest);
    fetcherSpy.mockImplementation(() => Promise.reject(apiError));

    renderComponent();

    await submitValidForm();

    await waitFor(() => {
      expect(screen.getByText(/error with submission/i)).toBeVisible();
    });
  });

  it("should show unexpected error message on not fetch ApiError", async () => {
    const apiError = new Error("unexpected error");
    fetcherSpy.mockImplementation(() => Promise.reject(apiError));

    renderComponent();

    await submitValidForm();

    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeVisible();
      expect(fetcherSpy).toHaveBeenCalled();
    });
  });
});
