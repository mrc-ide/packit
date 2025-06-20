import { render, screen, waitFor } from "@testing-library/react";
import { rest } from "msw";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SWRConfig } from "swr";
import { PacketReadPermission } from "../../../../app/components/contents/PacketReadPermission/PacketReadPermission";
import { HttpStatus } from "../../../../lib/types/HttpStatus";
import { server } from "../../../../msw/server";
import { mockNonUsernameRolesWithRelationships, mockPacket } from "../../../mocks";
import { packetIndexUri } from "../../../../msw/handlers/packetHandlers";
import { UserProvider } from "../../../../app/components/providers/UserProvider";
import { PacketLayout } from "../../../../app/components/main";

const renderComponent = () =>
  render(
    <SWRConfig value={{ dedupingInterval: 0, provider: () => new Map() }}>
      <UserProvider>
        <MemoryRouter initialEntries={[`/${mockPacket.name}/${mockPacket.id}/read-access`]}>
          <Routes>
            <Route element={<PacketLayout />}>
              <Route path="/:packetName/:packetId/read-access" element={<PacketReadPermission />} />
            </Route>
          </Routes>
        </MemoryRouter>
      </UserProvider>
    </SWRConfig>
  );

describe("PacketReadPermission", () => {
  it("should render unauthorized if roles and user response returns unauthorized", async () => {
    server.use(
      rest.get("*", (req, res, ctx) => {
        return res(ctx.status(HttpStatus.Unauthorized));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/unauthorized/i)).toBeVisible();
    });
  });

  it("should render error message when error occurs fetching roles & users", async () => {
    server.use(
      rest.get(`${packetIndexUri}/:id/read-permission`, (req, res, ctx) => {
        return res(ctx.status(400));
      })
    );
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/error fetching data/i)).toBeVisible();
    });
  });

  it("should render roles table and user table correctly", async () => {
    const { container } = renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/roles with read access/i)).toBeVisible();
      expect(screen.getByText(/specific users with read access/i)).toBeVisible();
    });

    mockNonUsernameRolesWithRelationships.forEach((role) => {
      if (role.rolePermissions.length > 0) {
        expect(screen.getByText(role.name)).toBeVisible();
        role.users.forEach((user) => {
          expect(screen.getAllByText(user.username, { exact: false })[0]).toBeVisible();
        });
      }
    });

    const usersList = container.getElementsByClassName("max-h-64 rounded-md border p-4 md:max-w-lg overflow-auto");
    expect(usersList.item(0) as Element).toContainHTML("a@gmail.com"); // has specific read access also
  });
});
