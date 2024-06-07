import * as fetch from "../../../../lib/fetch";
import { server } from "../../../../msw/server";
import { rest } from "msw";
import { HttpStatus } from "../../../../lib/types/HttpStatus";
import { render, screen, waitFor } from "@testing-library/react";
import { AddBasicUserButton } from "../../../../app/components/contents/manageAccess/AddBasicUserButton";
import userEvent from "@testing-library/user-event";
import appConfig from "../../../../config/appConfig";

describe("AddBasicUser", () => {
  const fetcherSpy = jest.spyOn(fetch, "fetcher");
  const roleNames = ["role1", "role2", "role3", "role4", "role5"];
  const userFormValues = {
    email: "random@gmail.com",
    displayName: "Test User",
    password: "password",
    userRoles: ["role1", "role3"]
  };

  it("should open dialog on add user button click with form", async () => {
    render(<AddBasicUserButton mutate={jest.fn()} roleNames={roleNames} />);

    userEvent.click(screen.getByRole("button", { name: /add user/i }));

    await waitFor(() => {
      expect(screen.getByText(/add new user/i)).toBeVisible();
    });
    expect(screen.getByLabelText(/email/i)).toBeVisible();
    expect(screen.getByLabelText(/display name/i)).toBeVisible();
    expect(screen.getByLabelText(/password/i)).toBeVisible();
    expect(screen.getByPlaceholderText(/select roles/i)).toBeVisible();
  });

  it("should close dialog and clear form on cancel button click", () => {
    render(<AddBasicUserButton mutate={jest.fn()} roleNames={roleNames} />);
    const addUserButton = screen.getByRole("button", { name: /add user/i });
    userEvent.click(addUserButton);

    userEvent.type(screen.getByLabelText(/email/i), "test@gmail.com");
    userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.queryByText(/add new user/i)).not.toBeInTheDocument();

    userEvent.click(addUserButton);

    expect(screen.getByLabelText(/email/i)).toHaveValue("");
  });

  it("should close dialog, reset form, call mutate on successful form submission", async () => {
    const mutate = jest.fn();
    render(<AddBasicUserButton mutate={mutate} roleNames={roleNames} />);
    const addUserButton = screen.getByRole("button", { name: /add user/i });
    userEvent.click(addUserButton);

    userEvent.type(screen.getByLabelText(/email/i), userFormValues.email);
    userEvent.type(screen.getByLabelText(/display name/i), userFormValues.displayName);
    userEvent.type(screen.getByLabelText(/password/i), userFormValues.password);
    userEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      expect(fetcherSpy).toHaveBeenCalled();
    });
    expect(mutate).toHaveBeenCalled();
    expect(screen.queryByText(/add new user/i)).not.toBeInTheDocument();

    userEvent.click(addUserButton);

    expect(screen.getByLabelText(/email/i)).toHaveValue("");
  });

  it("should call fetch with correct params on successful form submission", async () => {
    render(<AddBasicUserButton mutate={jest.fn()} roleNames={roleNames} />);
    const addUserButton = screen.getByRole("button", { name: /add user/i });
    userEvent.click(addUserButton);

    userEvent.type(screen.getByLabelText(/email/i), userFormValues.email);
    userEvent.type(screen.getByLabelText(/display name/i), userFormValues.displayName);
    userEvent.type(screen.getByLabelText(/password/i), userFormValues.password);
    userEvent.click(screen.getByRole("combobox"));
    userEvent.click(screen.getByRole("option", { name: roleNames[0] }));
    userEvent.click(screen.getByRole("option", { name: roleNames[2] }));
    userEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      expect(fetcherSpy).toHaveBeenCalledWith({
        url: `${appConfig.apiUrl()}/user/basic`,
        body: userFormValues,
        method: "POST"
      });
    });
  });

  it("should validate email, display error message on form submission without calling fetch", async () => {
    render(<AddBasicUserButton mutate={jest.fn()} roleNames={roleNames} />);
    const addUserButton = screen.getByRole("button", { name: /add user/i });
    userEvent.click(addUserButton);

    userEvent.type(screen.getByLabelText(/email/i), "invalid-email");
    userEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeVisible();
    });
    // display name and password error messages
    expect(screen.getByText(/string must contain at least 1 character/i)).toBeVisible();
    expect(screen.getByText(/string must contain at least 8 character/i)).toBeVisible();
    expect(fetcherSpy).not.toHaveBeenCalled();
  });

  it("should show error message when role name is not trimmed", async () => {
    render(<AddBasicUserButton mutate={jest.fn()} roleNames={roleNames} />);
    userEvent.click(screen.getByRole("button", { name: /add user/i }));

    userEvent.type(screen.getByLabelText(/name/i), " trim ");
    userEvent.click(screen.getByRole("button", { name: /add/i }));

    await waitFor(() => {
      expect(screen.getByText("name must contain no leading/trailing spaces.")).toBeVisible();
    });
  });

  it("should display error message when fetch fails with bad request", () => {
    const errorMessage = "user already exists";
    server.use(
      rest.post("*", (req, res, ctx) => {
        return res(ctx.status(HttpStatus.BadRequest), ctx.json({ error: { detail: errorMessage } }));
      })
    );
    render(<AddBasicUserButton mutate={jest.fn()} roleNames={roleNames} />);
    const addUserButton = screen.getByRole("button", { name: /add user/i });
    userEvent.click(addUserButton);

    userEvent.type(screen.getByLabelText(/email/i), userFormValues.email);
    userEvent.type(screen.getByLabelText(/display name/i), userFormValues.displayName);
    userEvent.type(screen.getByLabelText(/password/i), userFormValues.password);
    userEvent.click(screen.getByRole("button", { name: /add/i }));

    waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeVisible();
    });
  });

  it("should display error message when fetch fails that is not bad request", () => {
    const errorMessage = "unexpected error message";
    server.use(
      rest.post("*", (req, res, ctx) => {
        return res(ctx.status(HttpStatus.InternalServerError), ctx.json({ error: { detail: errorMessage } }));
      })
    );
    render(<AddBasicUserButton mutate={jest.fn()} roleNames={roleNames} />);
    const addUserButton = screen.getByRole("button", { name: /add user/i });
    userEvent.click(addUserButton);

    userEvent.type(screen.getByLabelText(/email/i), userFormValues.email);
    userEvent.type(screen.getByLabelText(/display name/i), userFormValues.displayName);
    userEvent.type(screen.getByLabelText(/password/i), userFormValues.password);
    userEvent.click(screen.getByRole("button", { name: /add/i }));

    waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeVisible();
    });
  });
});
