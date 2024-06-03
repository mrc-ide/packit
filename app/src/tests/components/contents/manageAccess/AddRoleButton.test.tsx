import { render, screen, waitFor } from "@testing-library/react";
import { AddRoleButton } from "../../../../app/components/contents/manageAccess/AddRoleButton";
import userEvent from "@testing-library/user-event";
import { GLOBAL_PERMISSIONS } from "../../../../lib/constants";
import * as fetch from "../../../../lib/fetch";
import { server } from "../../../../msw/server";
import { rest } from "msw";
import { HttpStatus } from "../../../../lib/types/HttpStatus";

describe("AddRoleButton", () => {
  const fetcherSpy = jest.spyOn(fetch, "fetcher");

  it("should open dialog on add role button click with form", async () => {
    render(<AddRoleButton mutate={jest.fn()} />);

    userEvent.click(screen.getByRole("button", { name: /add role/i }));

    await waitFor(() => {
      expect(screen.getByText(/create new role/i)).toBeVisible();
    });
    expect(screen.getByLabelText(/name/i)).toBeVisible();
    GLOBAL_PERMISSIONS.forEach((permission) => {
      expect(screen.getByText(permission)).toBeVisible();
      expect(screen.getByRole("checkbox", { name: permission })).toBeVisible();
    });
  });

  it("should close dialog and clear form on cancel button click", () => {
    render(<AddRoleButton mutate={jest.fn()} />);

    const addRoleButton = screen.getByRole("button", { name: /add role/i });
    userEvent.click(addRoleButton);

    userEvent.type(screen.getByLabelText(/name/i), "Test Role");
    userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.queryByText(/create new role/i)).not.toBeInTheDocument();

    userEvent.click(addRoleButton);

    expect(screen.getByLabelText(/name/i)).toHaveValue("");
  });

  it("should close dialog, reset form, call mutate on successful form submission", async () => {
    const mutate = jest.fn();
    render(<AddRoleButton mutate={mutate} />);

    const addRoleButton = screen.getByRole("button", { name: /add role/i });
    userEvent.click(addRoleButton);

    userEvent.type(screen.getByLabelText(/name/i), "Test Role");
    userEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      expect(fetcherSpy).toHaveBeenCalled();
    });
    expect(mutate).toHaveBeenCalled();
    expect(screen.queryByText(/create new role/i)).not.toBeInTheDocument();

    userEvent.click(addRoleButton);

    expect(screen.getByLabelText(/name/i)).toHaveValue("");
  });

  it("should call fetch with correct role name and permissionNames checked on submission", async () => {
    render(<AddRoleButton mutate={jest.fn()} />);
    userEvent.click(screen.getByRole("button", { name: /add role/i }));

    userEvent.type(screen.getByLabelText(/name/i), "Test Role");
    userEvent.click(screen.getByRole("checkbox", { name: GLOBAL_PERMISSIONS[0] }));
    userEvent.click(screen.getByRole("checkbox", { name: GLOBAL_PERMISSIONS[1] }));
    userEvent.click(screen.getByRole("checkbox", { name: GLOBAL_PERMISSIONS[0] }));
    userEvent.click(screen.getByRole("checkbox", { name: GLOBAL_PERMISSIONS[2] }));

    userEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      expect(fetcherSpy).toHaveBeenCalledWith({
        url: expect.any(String),
        body: { name: "Test Role", permissionNames: [GLOBAL_PERMISSIONS[1], GLOBAL_PERMISSIONS[2]] },
        method: "POST"
      });
    });
  });

  it("should show error message when role name is empty", async () => {
    render(<AddRoleButton mutate={jest.fn()} />);
    userEvent.click(screen.getByRole("button", { name: /add role/i }));

    userEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      expect(screen.getByText(/string must contain at least 1 character/i)).toBeVisible();
    });
  });

  it("should show error message when role name is not trimmed", async () => {
    render(<AddRoleButton mutate={jest.fn()} />);
    userEvent.click(screen.getByRole("button", { name: /add role/i }));

    userEvent.type(screen.getByLabelText(/name/i), " trim");
    userEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Name must only contain alphanumeric characters & no leading/trailing spaces.")
      ).toBeVisible();
    });
  });

  it("should show error message when role name contains special characters", async () => {
    render(<AddRoleButton mutate={jest.fn()} />);
    userEvent.click(screen.getByRole("button", { name: /add role/i }));

    userEvent.type(screen.getByLabelText(/name/i), "Test, Role");
    userEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      expect(
        screen.getByText("Name must only contain alphanumeric characters & no leading/trailing spaces.")
      ).toBeVisible();
    });
  });

  it("should display error message when fetch fails with bad request", () => {
    const errorMessage = "Role name exists";
    server.use(
      rest.post("*", (req, res, ctx) => {
        return res(ctx.status(HttpStatus.BadRequest), ctx.json({ error: { detail: errorMessage } }));
      })
    );
    render(<AddRoleButton mutate={jest.fn()} />);

    userEvent.click(screen.getByRole("button", { name: /add role/i }));
    userEvent.type(screen.getByLabelText(/name/i), "Test Role");
    userEvent.click(screen.getByRole("button", { name: /add/i }));

    waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeVisible();
    });
  });
  it("should display error message when fetch fails with unexpected error", () => {
    server.use(
      rest.post("*", (req, res, ctx) => {
        return res(ctx.status(HttpStatus.InternalServerError));
      })
    );
    render(<AddRoleButton mutate={jest.fn()} />);

    userEvent.click(screen.getByRole("button", { name: /add role/i }));
    userEvent.type(screen.getByLabelText(/name/i), "Test Role");
    userEvent.click(screen.getByRole("button", { name: /add/i }));

    waitFor(() => {
      expect(screen.getByText(/an unexpected error occurred. please try again/i)).toBeVisible();
    });
  });
});
