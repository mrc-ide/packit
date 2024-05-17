import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { AuthLayoutForm } from "../../../app/components/login";

describe("AuthLayoutForm", () => {
  it("should render outlet", () => {
    render(
      <MemoryRouter initialEntries={["/test"]}>
        <Routes>
          <Route element={<AuthLayoutForm />}>
            <Route path="/test" element={<div>test</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/test/)).toBeVisible();
  });
});
