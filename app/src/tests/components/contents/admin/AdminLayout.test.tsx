import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AdminLayout } from "../../../../app/components/contents/admin";
import { server } from "../../../../msw/server";
import { rest } from "msw";
import { HttpStatus } from "../../../../lib/types/HttpStatus";
import { SWRConfig } from "swr";
import * as UserProviderModule from "../../../../app/components/providers/UserProvider";

const mockUseUser = jest.spyOn(UserProviderModule, "useUser");

const renderComponent = () =>
  render(
    <SWRConfig value={{ provider: () => new Map() }}>
      <UserProviderModule.UserProvider>
        <MemoryRouter initialEntries={["/manage-roles"]}>
          <Routes>
            <Route element={<AdminLayout />}>
              <Route path="manage-roles" element={<div>role management</div>} />
              <Route path="manage-users" element={<div>user management</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </UserProviderModule.UserProvider>
    </SWRConfig>
  );

describe("AdminLayout", () => {
  beforeEach(() => {
    mockUseUser.mockReturnValue({
      authorities: ["user.manage", "packet.manage"]
    } as any);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("should allow navigation between sidebar and render outlet when user access", async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("role management")).toBeVisible();
    });

    userEvent.click(screen.getByRole("link", { name: "Manage Users" }));

    expect(screen.getByText("user management")).toBeVisible();
  });

  it("should show unauthorized when api returns unauthorized", async () => {
    server.use(
      rest.get("*", (req, res, ctx) => {
        return res(ctx.status(HttpStatus.Unauthorized));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Unauthorized/)).toBeVisible();
    });
  });
  it("should show error message when api returns error no unauthorized", async () => {
    server.use(
      rest.get("*", (req, res, ctx) => {
        return res(ctx.status(HttpStatus.InternalServerError));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Error fetching data/)).toBeVisible();
    });
  });
});
