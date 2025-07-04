import { render, screen, waitFor } from "@testing-library/react";
import { BasicUserAuthForm } from "@components/login/BasicUserAuthForm";
import { MemoryRouter } from "react-router-dom";
import { UserProvider } from "@components/providers/UserProvider";
import userEvent from "@testing-library/user-event";
import { server } from "@/msw/server";
import { rest } from "msw";

const mockedUsedNavigate = vitest.fn();
vitest.mock("react-router-dom", async () => ({
  ...((await vitest.importActual("react-router-dom")) as any),
  useNavigate: () => mockedUsedNavigate
}));

const mockSetRequestedUrl = vitest.fn();
let mockRequestedUrl: string | null = null;
vitest.mock("@components/providers/RedirectOnLoginProvider", () => ({
  useRedirectOnLogin: () => ({
    setRequestedUrl: mockSetRequestedUrl,
    requestedUrl: (() => mockRequestedUrl)()
  })
}));

describe("BasicUserAuthForm", () => {
  beforeEach(() => {
    mockRequestedUrl = null;
    vitest.clearAllMocks();
  });

  it("should validate both email and password by showing errors if fails schema", async () => {
    render(
      <MemoryRouter>
        <UserProvider>
          <BasicUserAuthForm />
        </UserProvider>
      </MemoryRouter>
    );

    userEvent.type(await screen.findByLabelText(/email/i), "invalid-email");
    userEvent.type(screen.getByLabelText(/password/i), "short");
    userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/string must contain/i)).toBeInTheDocument();
  });

  it("should submit and navigate to home page if successful submission", async () => {
    render(
      <MemoryRouter>
        <UserProvider>
          <BasicUserAuthForm />
        </UserProvider>
      </MemoryRouter>
    );

    userEvent.type(screen.getByLabelText(/email/i), "test@gmail.com");
    userEvent.type(screen.getByLabelText(/password/i), "password");
    userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith("/");
    });
  });

  it("should navigate to saved redirect page if successful submission", async () => {
    mockRequestedUrl = "/accessibility";

    render(
      <MemoryRouter>
        <UserProvider>
          <BasicUserAuthForm />
        </UserProvider>
      </MemoryRouter>
    );

    userEvent.type(screen.getByLabelText(/email/i), "test@gmail.com");
    userEvent.type(screen.getByLabelText(/password/i), "password");
    userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith("/accessibility");
      expect(mockSetRequestedUrl).toHaveBeenCalledWith(null);
    });
  });

  it("should show error message on email and password fields if api returns 401", async () => {
    server.use(
      rest.post("*", (req, res, ctx) => {
        return res(ctx.status(401));
      })
    );
    render(
      <MemoryRouter>
        <UserProvider>
          <BasicUserAuthForm />
        </UserProvider>
      </MemoryRouter>
    );

    userEvent.type(screen.getByLabelText(/email/i), "test@gmail.com");
    userEvent.type(screen.getByLabelText(/password/i), "password");
    userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/invalid email or password/i).length).toBe(2);
    });
  });

  it("should navigate to update password page if api returns 403 forbidden with update password message", async () => {
    const errorMessage = "must change your password";
    const email = "test@email.com";
    server.use(
      rest.post("*", (req, res, ctx) => {
        return res(ctx.status(403), ctx.json({ error: { detail: errorMessage } }));
      })
    );
    render(
      <MemoryRouter>
        <UserProvider>
          <BasicUserAuthForm />
        </UserProvider>
      </MemoryRouter>
    );

    userEvent.type(screen.getByLabelText(/email/i), email);
    userEvent.type(screen.getByLabelText(/password/i), "password");
    userEvent.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockedUsedNavigate).toHaveBeenCalledWith(`/update-password?email=${email}&error=${errorMessage}`);
    });
  });

  it("should fill in email and success message if update password success message is in search params", async () => {
    const successMessage = "Password updated successfully. Please log in.";
    const email = "test@email.com";
    render(
      <MemoryRouter initialEntries={[`/login?email=${email}&success=${successMessage}`]}>
        <UserProvider>
          <BasicUserAuthForm />
        </UserProvider>
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/email/i)).toHaveValue(email);
    expect(screen.getByText(successMessage)).toBeVisible();
  });
});
