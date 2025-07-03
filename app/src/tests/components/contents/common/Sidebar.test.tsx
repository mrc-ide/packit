import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Sidebar } from "@components/contents/common/Sidebar";

describe("Sidebar", () => {
  it("should render sidebar items with children and correct button type based on current route", () => {
    const sidebarItems = [
      {
        to: "/manage-roles",
        title: "Manage Roles"
      },
      {
        to: "/manage-users",
        title: "Manage Users"
      }
    ];
    render(
      <MemoryRouter initialEntries={["/manage-roles"]}>
        <Sidebar sidebarItems={sidebarItems}>
          <div>main content</div>
        </Sidebar>
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Manage Roles" })).toHaveClass("bg-secondary");
    expect(screen.getByRole("link", { name: "Manage Users" })).not.toHaveClass("bg-secondary");
    expect(screen.getByText("main content")).toBeVisible();
  });
});
