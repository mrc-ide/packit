import { MemoryRouter } from "react-router-dom";
import { UserProvider } from "../../../app/components/providers/UserProvider";
import { UpdatePasswordForm } from "../../../app/components/login/UpdatePasswordForm";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { server } from "../../../msw/server";
import { rest } from "msw";
import { HttpStatus } from "../../../lib/types/HttpStatus";

const mockedUsedNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...(jest.requireActual("react-router-dom") as any),
  useNavigate: () => mockedUsedNavigate
}));
describe("UpdatePasswordForm", () => {
  const testEmail = "test@email.com";
  it("should validate both email and password by showing errors if fails schema", async () => {
    render(
      <MemoryRouter>
        <UserProvider>
          <UpdatePasswordForm email={testEmail} />
        </UserProvider>
      </MemoryRouter>
    );

    const currentPasswordInput = screen.getByLabelText(/current password/i);
    const newPasswordInput = screen.getByLabelText(/new password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    // length of 8 test
    userEvent.type(currentPasswordInput, "short");
    userEvent.type(newPasswordInput, "short");
    userEvent.type(confirmPasswordInput, "short");
    userEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getAllByText("String must contain at least 8 character(s)").length).toBe(3);
    });

    // password match test
    userEvent.type(currentPasswordInput, "password");
    userEvent.type(newPasswordInput, "password");
    userEvent.type(confirmPasswordInput, "notmatchingPassword");

    await waitFor(() => {
      expect(screen.getByText("Passwords do not match")).toBeVisible();
      expect(screen.getByText("New password must be different from current password")).toBeVisible();
    });
  });

  describe("successfull submission and post tests", () => {
    const submitForm = async () => {
      userEvent.type(screen.getByLabelText(/current password/i), "password");
      userEvent.type(screen.getByLabelText(/new password/i), "newpassword");
      userEvent.type(screen.getByLabelText(/confirm password/i), "newpassword");
      userEvent.click(screen.getByRole("button", { name: /submit/i }));
    };
    it("should submit and navigate to login page if successful submission", async () => {
      server.use(
        rest.post("*", (req, res, ctx) => {
          return res(ctx.status(204));
        })
      );
      render(
        <MemoryRouter>
          <UserProvider>
            <UpdatePasswordForm email={testEmail} />
          </UserProvider>
        </MemoryRouter>
      );

      await submitForm();

      await waitFor(() => {
        expect(mockedUsedNavigate).toHaveBeenCalledWith(
          `/login?email=${testEmail}&success=Password updated successfully. Please log in.`
        );
      });
    });

    it("should show error message under current password if bad request", async () => {
      const invalidPasswordMessage = "invalid password";
      server.use(
        rest.post("*", (req, res, ctx) => {
          return res(ctx.status(HttpStatus.BadRequest), ctx.json({ error: { detail: invalidPasswordMessage } }));
        })
      );
      render(
        <MemoryRouter>
          <UserProvider>
            <UpdatePasswordForm email={testEmail} />
          </UserProvider>
        </MemoryRouter>
      );

      await submitForm();

      await waitFor(() => {
        expect(screen.getByText(invalidPasswordMessage)).toBeVisible();
      });
    });

    it("should show error message if unexpected error", async () => {
      const errorMessage = "User was not found!!!";
      server.use(
        rest.post("*", (req, res, ctx) => {
          return res(ctx.status(HttpStatus.InternalServerError), ctx.json({ error: { detail: errorMessage } }));
        })
      );
      render(
        <MemoryRouter>
          <UserProvider>
            <UpdatePasswordForm email={testEmail} />
          </UserProvider>
        </MemoryRouter>
      );

      await submitForm();

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeVisible();
      });
    });
  });
});
