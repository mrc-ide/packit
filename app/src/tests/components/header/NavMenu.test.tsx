import { fireEvent, render, screen } from "@testing-library/react";
import { NavMenu } from "../../../app/components/header/NavMenu";
import { MemoryRouter } from "react-router-dom";

describe("NavMenu component", () => {
  it("should render all nav items when relevant permissions are present", () => {
    render(
      <MemoryRouter>
        <NavMenu authorities={["packet.run", "user.manage"]} />
      </MemoryRouter>
    );
/*
    Object.entries(NavItems).forEach(async ([to, title]) => {
      navItemIsDisplayedOnLargeScreens(to, title);
      await navItemIsDisplayedOnSmallScreens(to, title);
    });*/
  });

  it("should not render Runner nav item when relevant permission is not present", () => {
    render(
      <MemoryRouter>
        <NavMenu authorities={["user.manage"]} />
      </MemoryRouter>
    );
/*
    Object.entries(NavItems).forEach(async ([to, title]) => {
      if (to === "runner") {
        navItemIsNotDisplayedOnLargeScreens(to, title);
        await navItemIsNotDisplayedOnSmallScreens(to, title);
      } else {
        navItemIsDisplayedOnLargeScreens(to, title);
        await navItemIsDisplayedOnSmallScreens(to, title);
      }
    });*/
  });

  it("should not render Manage Access nav item when relevant permission is not present", () => {
    render(
      <MemoryRouter>
        <NavMenu authorities={["packet.run"]} />
      </MemoryRouter>
    );
/*
    Object.entries(NavItems).forEach(async ([to, title]) => {
      if (to === "manage-roles") {
        navItemIsNotDisplayedOnLargeScreens(to, title);
        await navItemIsNotDisplayedOnSmallScreens(to, title);
      } else {
        navItemIsDisplayedOnLargeScreens(to, title);
        await navItemIsDisplayedOnSmallScreens(to, title);
      }
    });*/
  });

  it("should render all non-secured nav items when no permissions are present", () => {
    render(
      <MemoryRouter>
        <NavMenu authorities={[""]} />
      </MemoryRouter>
    );
/*
    Object.entries(NavItems).forEach(async ([to, title]) => {
      if (to === "manage-roles" || to === "runner") {
        navItemIsNotDisplayedOnLargeScreens(to, title);
        await navItemIsNotDisplayedOnSmallScreens(to, title);
      } else {
        navItemIsDisplayedOnLargeScreens(to, title);
        await navItemIsDisplayedOnSmallScreens(to, title);
      }
    });*/
  });
});

const navItemIsDisplayedOnLargeScreens = (to: string, title: string) => {
  const link = screen.getByRole("link", { name: title });
  expect(link).toBeVisible();
  expect(link).toHaveAttribute("href", `/${to}`);
};

const navItemIsNotDisplayedOnLargeScreens = (to: string, title: string) => {
  expect(screen.queryByRole("link", { name: title })).not.toBeInTheDocument();
};

const navItemIsDisplayedOnSmallScreens = async (to: string, title: string) => {
  await pressDownKey();

  const link = screen.getByRole("menuitem", { name: title });
  expect(link).toBeVisible();
  expect(link).toHaveAttribute("href", `/${to}`);
};

const navItemIsNotDisplayedOnSmallScreens = async (to: string, title: string) => {
  await pressDownKey();

  expect(screen.queryByRole("menuitem", { name: title })).not.toBeInTheDocument();
};

const pressDownKey = async () => {
  fireEvent.keyDown(await screen.findByRole("button"), { keyCode: 40 });
};
