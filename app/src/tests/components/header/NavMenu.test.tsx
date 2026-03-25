import { fireEvent, render, screen } from "@testing-library/react";
import { NavMenu } from "@components/header/NavMenu";
import { useGetRunnerEnabled } from "@components/header/hooks/useGetRunnerEnabled";
import { MemoryRouter } from "react-router-dom";

vitest.mock("@components/header/hooks/useGetRunnerEnabled", () => ({
  useGetRunnerEnabled: vitest.fn()
}));

const mockedUseGetRunnerEnabled = vitest.mocked(useGetRunnerEnabled);

describe("NavMenu component", () => {
  const userManageNavItems = {
    runner: "Runner",
    "manage-roles": "Admin"
  };

  beforeEach(() => {
    mockedUseGetRunnerEnabled.mockReturnValue({
      isRunnerEnabled: true,
      isLoading: false,
      error: undefined
    });
  });

  it("should render all nav items when relevant permissions are present", () => {
    render(
      <MemoryRouter>
        <NavMenu authorities={["packet.run", "user.manage"]} />
      </MemoryRouter>
    );

    Object.entries(userManageNavItems).forEach(async ([to, title]) => {
      navItemIsDisplayedOnLargeScreens(to, title);
      await navItemIsDisplayedOnSmallScreens(to, title);
    });
  });

  it("should not render Runner nav item when relevant permission is not present", () => {
    render(
      <MemoryRouter>
        <NavMenu authorities={["user.manage"]} />
      </MemoryRouter>
    );

    Object.entries(userManageNavItems).forEach(async ([to, title]) => {
      if (to === "runner") {
        navItemIsNotDisplayedOnLargeScreens(title);
        await navItemIsNotDisplayedOnSmallScreens(title);
      } else {
        navItemIsDisplayedOnLargeScreens(to, title);
        await navItemIsDisplayedOnSmallScreens(to, title);
      }
    });
  });

  it("should not render Admin nav item when relevant permission is not present", () => {
    render(
      <MemoryRouter>
        <NavMenu authorities={["packet.run"]} />
      </MemoryRouter>
    );

    Object.entries(userManageNavItems).forEach(async ([to, title]) => {
      if (to === "manage-roles") {
        navItemIsNotDisplayedOnLargeScreens(title);
        await navItemIsNotDisplayedOnSmallScreens(title);
      } else {
        navItemIsDisplayedOnLargeScreens(to, title);
        await navItemIsDisplayedOnSmallScreens(to, title);
      }
    });
  });

  it("should render all non-secured nav items when no permissions are present", () => {
    render(
      <MemoryRouter>
        <NavMenu authorities={[""]} />
      </MemoryRouter>
    );

    Object.entries(userManageNavItems).forEach(async ([to, title]) => {
      if (to === "manage-roles" || to === "runner") {
        navItemIsNotDisplayedOnLargeScreens(title);
        await navItemIsNotDisplayedOnSmallScreens(title);
      } else {
        navItemIsDisplayedOnLargeScreens(to, title);
        await navItemIsDisplayedOnSmallScreens(to, title);
      }
    });
  });

  it("should not render Runner nav item when runner is disabled", () => {
    mockedUseGetRunnerEnabled.mockReturnValueOnce({
      isRunnerEnabled: false,
      isLoading: false,
      error: undefined
    });

    render(
      <MemoryRouter>
        <NavMenu authorities={["packet.run", "user.manage"]} />
      </MemoryRouter>
    );

    navItemIsNotDisplayedOnLargeScreens("Runner");
    navItemIsDisplayedOnLargeScreens("manage-roles", "Admin");
  });
});

const navItemIsDisplayedOnLargeScreens = (to: string, title: string) => {
  const link = screen.getByRole("link", { name: title });
  expect(link).toBeVisible();
  expect(link).toHaveAttribute("href", `/${to}`);
};

const navItemIsNotDisplayedOnLargeScreens = (title: string) => {
  expect(screen.queryByRole("link", { name: title })).not.toBeInTheDocument();
};

const navItemIsDisplayedOnSmallScreens = async (to: string, title: string) => {
  await pressDownKey();

  const link = screen.getByRole("menuitem", { name: title });
  expect(link).toBeVisible();
  expect(link).toHaveAttribute("href", `/${to}`);
};

const navItemIsNotDisplayedOnSmallScreens = async (title: string) => {
  await pressDownKey();

  expect(screen.queryByRole("menuitem", { name: title })).not.toBeInTheDocument();
};

const pressDownKey = async () => {
  fireEvent.keyDown(await screen.findByRole("button"), { keyCode: 40 });
};
