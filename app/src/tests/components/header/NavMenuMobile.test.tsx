import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LeftNavItems } from "../../../app/components/header/LeftNav";
import { NavMenuMobile } from "../../../app/components/header/NavMenuMobile";
import { UserState } from "../../../app/components/providers/types/UserTypes";

describe("Nav Menu Mobile component", () => {
  const DOWN_ARROW = { keyCode: 40 };
  it("should render mobile nav menu with all links if packet.run permission is present", async () => {
    render(
      <MemoryRouter>
        <NavMenuMobile user={{ authorities: ["packet.run"] } as UserState} />
      </MemoryRouter>
    );

    fireEvent.keyDown(await screen.findByRole("button"), DOWN_ARROW);

    Object.entries(LeftNavItems).forEach(([to, title]) => {
      const link = screen.getByRole("menuitem", { name: title });

      expect(link).toBeVisible();
      expect(link).toHaveAttribute("href", `/${to}`);
    });
  });

  it("should render all menu items except runner when packet.run permission is not present", async () => {
    render(
      <MemoryRouter>
        <NavMenuMobile user={{ authorities: [""] } as UserState} />
      </MemoryRouter>
    );

    fireEvent.keyDown(await screen.findByRole("button"), DOWN_ARROW);

    Object.entries(LeftNavItems).forEach(([to, title]) => {
      if (to === "runner") {
        expect(screen.queryByRole("menuitem", { name: title })).not.toBeInTheDocument();
      } else {
        const link = screen.getByRole("menuitem", { name: title });

        expect(link).toBeVisible();
        expect(link).toHaveAttribute("href", `/${to}`);
      }
    });
  });
});
