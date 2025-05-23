import { render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { UserProvider, useUser } from "../../../app/components/providers/UserProvider";
import { UserState } from "../../../app/components/providers/types/UserTypes";
import { LocalStorageKeys } from "../../../lib/types/LocalStorageKeys";
import { mockAuthorities, mockToken, mockUserState } from "../../mocks";
import { SWRConfig } from "swr";
import { server } from "../../../msw/server";
import { rest } from "msw";

const mockGetUserFromLocalStorage = jest.fn((): null | UserState => null);
jest.mock("../../../lib/localStorageManager", () => ({
  ...jest.requireActual("../../../lib/localStorageManager"),
  getUserFromLocalStorage: () => mockGetUserFromLocalStorage()
}));
const renderElement = (children: JSX.Element) => {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
      <UserProvider>{children}</UserProvider>
    </SWRConfig>
  );
};
describe("UserProvider", () => {
  it("should throw error if useUser is used outside of UserProvider", () => {
    const TestComponent = () => {
      useUser();
      return <div>test</div>;
    };
    expect(() => render(<TestComponent />)).toThrowError("useUser must be used within a UserProvider");
  });

  it("should fill user state with returned values from getUserFromLocalStorage", async () => {
    const userState = mockUserState();

    mockGetUserFromLocalStorage.mockReturnValueOnce(userState);
    const TestComponent = () => {
      const { user } = useUser();
      return <div>{JSON.stringify(user)}</div>;
    };

    renderElement(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(JSON.stringify(userState))).toBeVisible();
    });
  });

  it("should setUser from token correctly & put into local storage when called", async () => {
    mockGetUserFromLocalStorage.mockReturnValueOnce(mockUserState());
    const TestComponent = () => {
      const { user, setUser } = useUser();
      useEffect(() => {
        setUser(mockToken);
      }, []);

      return <div>{JSON.stringify(user)}</div>;
    };

    renderElement(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(mockToken, { exact: false })).toBeVisible();
      expect(screen.getByText(/d@gmail.com/i)).toBeVisible();
      expect(JSON.parse(localStorage.getItem(LocalStorageKeys.USER) as string)?.userName).toBe("d@gmail.com");
    });
  });

  it("should set user to null in state and local storage when removeUser is called", async () => {
    mockGetUserFromLocalStorage.mockReturnValueOnce(mockUserState());
    const TestComponent = () => {
      const { user, removeUser } = useUser();
      useEffect(() => {
        removeUser();
      }, []);

      return <div>{user ? "present" : "empty"}</div>;
    };

    renderElement(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(/empty/i)).toBeVisible();
      expect(localStorage.getItem(LocalStorageKeys.USER)).toBe(null);
    });
  });

  it("should set authorities from useGetUserAuthorities", async () => {
    mockGetUserFromLocalStorage.mockReturnValueOnce(mockUserState());
    const TestComponent = () => {
      const { authorities } = useUser();
      return <div>{JSON.stringify(authorities)}</div>;
    };

    renderElement(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByText(JSON.stringify(mockAuthorities))).toBeVisible();
    });
  });

  it("should show error if authorities are not loaded", async () => {
    mockGetUserFromLocalStorage.mockReturnValueOnce(mockUserState());
    server.use(
      rest.get("*", (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    renderElement(<div>test</div>);

    await waitFor(() => {
      expect(screen.getByText(/failed to load user authorities/i)).toBeVisible();
    });
  });
});
