/* eslint-disable max-len */
import { render, screen, waitFor } from "@testing-library/react";
import * as fetch from "../../../../../lib/fetch";
import userEvent from "@testing-library/user-event";
import { Dialog } from "../../../../../app/components/Base/Dialog";
import { UpdateRoleUsersForm } from "../../../../../app/components/contents/manageAccess/manageRoleActions/UpdateRoleUsersForm";
import appConfig from "../../../../../config/appConfig";
import { ApiError } from "../../../../../lib/errors";
import { HttpStatus } from "../../../../../lib/types/HttpStatus";

describe("UpdateRoleUsersForm", () => {
  const fetcherSpy = vitest.spyOn(fetch, "fetcher");
  const testUsers = [
    { id: 1, username: "user1" },
    { id: 2, username: "user2" },
    { id: 3, username: "user3" },
    { id: 4, username: "user4" }
  ] as any[];
  const testRole = {
    users: [
      { id: 1, username: "user1" },
      { id: 2, username: "user2" }
    ],
    name: "role1"
  } as any;

  beforeEach(() => {
    vitest.clearAllMocks();
    fetcherSpy.mockResolvedValue({});
  });

  it("should call mutate,fetch,setOpen on successful form submission", async () => {
    const mutate = vitest.fn();
    const setOpen = vitest.fn();
    render(
      <Dialog>
        <UpdateRoleUsersForm role={testRole} users={testUsers} mutate={mutate} setOpen={setOpen} />
      </Dialog>
    );

    userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(fetcherSpy).toHaveBeenCalled();
    });
    expect(mutate).toHaveBeenCalled();
    expect(fetcherSpy).toHaveBeenCalled();
    expect(setOpen).toHaveBeenCalledWith(false);
  });

  it("should render correct options for both multiselect inputs", async () => {
    render(
      <Dialog>
        <UpdateRoleUsersForm role={testRole} users={testUsers} mutate={vitest.fn()} setOpen={vitest.fn()} />
      </Dialog>
    );

    userEvent.click(screen.getByPlaceholderText(/select usernames to add/i));

    const addUserOptions = await screen.findAllByRole("option");
    expect(addUserOptions).toHaveLength(2);
    expect(addUserOptions[0]).toHaveTextContent("user3");
    expect(addUserOptions[1]).toHaveTextContent("user4");

    userEvent.click(screen.getByPlaceholderText(/select usernames to remove/i));

    const removeUserOptions = await screen.findAllByRole("option");
    expect(removeUserOptions).toHaveLength(2);
    expect(removeUserOptions[0]).toHaveTextContent("user1");
    expect(removeUserOptions[1]).toHaveTextContent("user2");
  });

  it("should call fetcher with correct data on form submission", async () => {
    render(
      <Dialog>
        <UpdateRoleUsersForm role={testRole} users={testUsers} mutate={vitest.fn()} setOpen={vitest.fn()} />
      </Dialog>
    );

    userEvent.click(screen.getByPlaceholderText(/select usernames to add/i));
    userEvent.click(screen.getByText("user3"));
    userEvent.click(screen.getByText("user4"));

    userEvent.click(screen.getByPlaceholderText(/select usernames to remove/i));
    userEvent.click(screen.getByText("user1"));
    userEvent.click(screen.getByText("user2"));

    userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(fetcherSpy).toHaveBeenCalledWith({
        url: `${appConfig.apiUrl()}/roles/${testRole.name}/users`,
        body: { usernamesToAdd: ["user3", "user4"], usernamesToRemove: ["user1", "user2"] },
        method: "PUT"
      });
    });
  });

  it("should show error message on fetch ApiError", async () => {
    const apiError = new ApiError("could not find role", HttpStatus.BadRequest);
    fetcherSpy.mockImplementation(() => Promise.reject(apiError));

    render(
      <Dialog>
        <UpdateRoleUsersForm role={testRole} users={testUsers} mutate={vitest.fn()} setOpen={vitest.fn()} />
      </Dialog>
    );

    userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(apiError.message)).toBeVisible();
    });
  });

  it("should show unexpected error message on not fetch ApiError", async () => {
    const apiError = new Error("does not matter");
    fetcherSpy.mockImplementation(() => Promise.reject(apiError));

    render(
      <Dialog>
        <UpdateRoleUsersForm role={testRole} users={testUsers} mutate={vitest.fn()} setOpen={vitest.fn()} />
      </Dialog>
    );

    userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/an unexpected error occurred/i)).toBeVisible();
    });
  });
});
