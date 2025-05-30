import { render, screen } from "@testing-library/react";
import { LeftNav, LeftNavItems } from "../../../app/components/header/LeftNav";
import { MemoryRouter } from "react-router-dom";

describe("LeftNav component", () => {
  it("should render all left nav components when packet.run permission is present", () => {
    render(
      <MemoryRouter>
        <LeftNav authorities={["packet.run"]} />
      </MemoryRouter>
    );

    Object.entries(LeftNavItems).forEach(([to, title]) => {
      const link = screen.getByRole("link", { name: title });

      expect(link).toBeVisible();
      expect(link).toHaveAttribute("href", `/${to}`);
    });
  });

  it("should render all nav items except runner when packet.run permission is not present", () => {
    render(
      <MemoryRouter>
        <LeftNav authorities={[""]} />
      </MemoryRouter>
    );

    Object.entries(LeftNavItems).forEach(([to, title]) => {
      if (to === "runner") {
        expect(screen.queryByRole("link", { name: title })).not.toBeInTheDocument();
      } else {
        const link = screen.getByRole("link", { name: title });

        expect(link).toBeVisible();
        expect(link).toHaveAttribute("href", `/${to}`);
      }
    });
  });
});
