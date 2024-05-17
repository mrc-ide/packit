import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ManageAccessLayout } from "../../../../app/components/contents/manageAccess";
import userEvent from "@testing-library/user-event";

describe("ManageAccessLayout", () => {
  it("should allow navigation between sidebar and render outlet", async () => {
    render(
      <MemoryRouter initialEntries={["/manage-roles"]}>
        <Routes>
          <Route element={<ManageAccessLayout />}>
            <Route path="manage-roles" element={<div>role management</div>} />
            <Route path="manage-users" element={<div>user management</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("role management")).toBeVisible();

    userEvent.click(screen.getByRole("link", { name: "Manage Users" }));

    expect(screen.getByText("user management")).toBeVisible();
  });
});
