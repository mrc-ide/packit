import userEvent from "@testing-library/user-event";
import * as fetch from "@lib/fetch";
import { Dialog } from "../../../Base/Dialog";
import { UpdateUserRoleForm } from "./UpdateUserRoleForm";
import { render, screen, waitFor } from "@testing-library/react";
import appConfig from "@config/appConfig";
import { ApiError } from "@lib/errors";
import { HttpStatus } from "@lib/types/HttpStatus";

describe("UpdateUserRoleForm", () => {
  const fetcherSpy = vitest.spyOn(fetch, "fetcher");
  const testRoles = [
    { name: "role1", id: 1 },
    { name: "role2", id: 2 },
    { name: "role3", id: 3 },
    { name: "role4", id: 4 }
  ] as any[];
  const testUser = {
    roles: [
      { name: "role1", id: 1 },
      { name: "role2", id: 2 }
    ],
    username: "user1"
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
        <UpdateUserRoleForm user={testUser} roles={testRoles} mutate={mutate} setOpen={setOpen} />
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
        <UpdateUserRoleForm user={testUser} roles={testRoles} mutate={vitest.fn()} setOpen={vitest.fn()} />
      </Dialog>
    );

    userEvent.click(screen.getByPlaceholderText(/select roles to add/i));

    const addRoleOptions = await screen.findAllByRole("option");
    expect(addRoleOptions).toHaveLength(2);
    expect(addRoleOptions[0]).toHaveTextContent("role3");
    expect(addRoleOptions[1]).toHaveTextContent("role4");

    userEvent.click(screen.getByPlaceholderText(/select roles to remove/i));

    const removeRoleOptions = await screen.findAllByRole("option");
    expect(removeRoleOptions).toHaveLength(2);
    expect(removeRoleOptions[0]).toHaveTextContent("role1");
    expect(removeRoleOptions[1]).toHaveTextContent("role2");
  });

  it("should call fetcher with correct data on form submission", async () => {
    render(
      <Dialog>
        <UpdateUserRoleForm user={testUser} roles={testRoles} mutate={vitest.fn()} setOpen={vitest.fn()} />
      </Dialog>
    );

    userEvent.click(screen.getByPlaceholderText(/select roles to add/i));
    userEvent.click(screen.getByText("role3"));
    userEvent.click(screen.getByText("role4"));

    userEvent.click(screen.getByPlaceholderText(/select roles to remove/i));
    userEvent.click(screen.getByText("role1"));
    userEvent.click(screen.getByText("role2"));

    userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(fetcherSpy).toHaveBeenCalledWith({
        url: `${appConfig.apiUrl()}/user/${testUser.username}/roles`,
        body: {
          roleNamesToAdd: ["role3", "role4"],
          roleNamesToRemove: ["role1", "role2"]
        },
        method: "PUT"
      });
    });
  });

  it("should show error message on fetch ApiError", async () => {
    fetcherSpy.mockRejectedValueOnce(new ApiError("message from backend", HttpStatus.BadRequest));
    render(
      <Dialog>
        <UpdateUserRoleForm user={testUser} roles={testRoles} mutate={vitest.fn()} setOpen={vitest.fn()} />
      </Dialog>
    );

    userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText("message from backend")).toBeInTheDocument();
    });
  });

  it("should show error message on unexpected error", async () => {
    fetcherSpy.mockRejectedValueOnce(new Error("unexpected error"));
    render(
      <Dialog>
        <UpdateUserRoleForm user={testUser} roles={testRoles} mutate={vitest.fn()} setOpen={vitest.fn()} />
      </Dialog>
    );

    userEvent.click(screen.getByRole("button", { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText("An unexpected error occurred. Please try again.")).toBeInTheDocument();
    });
  });
});
