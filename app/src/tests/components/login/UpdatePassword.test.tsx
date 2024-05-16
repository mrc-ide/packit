import { MemoryRouter } from "react-router-dom";
import { UpdatePassword } from "../../../app/components/login";
import { render, screen, waitFor } from "@testing-library/react";

const mockUseAuthConfig = jest.fn();
jest.mock("../../../app/components/providers/AuthConfigProvider", () => ({
  useAuthConfig: () => mockUseAuthConfig()
}));
describe("UpdatePassword", () => {
  it("should show error message if no email found", async () => {
    mockUseAuthConfig.mockReturnValueOnce({ enableBasicLogin: true });
    render(
      <MemoryRouter>
        <UpdatePassword />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/invalid request, no email found/i)).toBeInTheDocument();
    });
  });

  it("should show error message if password update only available for basic auth", async () => {
    mockUseAuthConfig.mockReturnValueOnce({ enableBasicLogin: false });
    render(
      <MemoryRouter>
        <UpdatePassword />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/invalid request, password update only available for basic auth/i)).toBeInTheDocument();
    });
  });

  it("should show form and error message if email found", async () => {
    mockUseAuthConfig.mockReturnValueOnce({ enableBasicLogin: true });
    const errorMessage = "error message";
    render(
      <MemoryRouter initialEntries={[`/update-password?email=test@email.com&error=${errorMessage}`]}>
        <UpdatePassword />
      </MemoryRouter>
    );

    expect(screen.getByText(/update your password/i)).toBeVisible();
    expect(screen.getByText(errorMessage)).toBeVisible();
    expect(screen.getByLabelText(/current password/i)).toBeVisible();
  });
});
