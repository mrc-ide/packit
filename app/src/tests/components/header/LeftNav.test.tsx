import { render, screen } from "@testing-library/react";
import { LeftNav, LeftNavItems } from "../../../app/components/header/LeftNav";
import { UserState } from "../../../app/components/providers/types/UserTypes";
import { MemoryRouter } from "react-router-dom";

describe("LeftNav component", () => {
  it("should render all left nav components when packet.run permission is present", () => {
    render(
      <MemoryRouter>
        <LeftNav user={{ authorities: ["packet.run"] } as UserState} />
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
        <LeftNav user={{ authorities: [""] } as UserState} />
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
