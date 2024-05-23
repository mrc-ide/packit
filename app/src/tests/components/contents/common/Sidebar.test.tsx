import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { Sidebar } from "../../../../app/components/contents/common/Sidebar";

describe("Sidebar", () => {
  it("should render sidebar items with children and correct classes", () => {
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

    expect(screen.getByRole("link", { name: "Manage Roles" })).toHaveClass("bg-muted hover:bg-muted active");
    expect(screen.getByRole("link", { name: "Manage Users" })).toHaveClass("hover:bg-transparent hover:underline");
    expect(screen.getByText("main content")).toBeVisible();
  });
});
