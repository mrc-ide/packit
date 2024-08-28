import { render, screen, waitFor } from "@testing-library/react";
import { UserProvider, useUser } from "../../../app/components/providers/UserProvider";
import { UserState } from "../../../app/components/providers/types/UserTypes";
import { mockToken, mockUserState } from "../../mocks";
import { useEffect } from "react";
import { LocalStorageKeys } from "../../../lib/types/LocalStorageKeys";

const mockGetUserFromLocalStorage = jest.fn((): null | UserState => null);
jest.mock("../../../lib/localStorageManager", () => ({
  getUserFromLocalStorage: () => mockGetUserFromLocalStorage()
}));
const renderElement = (children: JSX.Element) => {
  return render(<UserProvider>{children}</UserProvider>);
};
describe("UserProvider", () => {
  it("should throw error if useUser is used outside of UserProvider", () => {
    const TestComponent = () => {
      useUser();
      return <div>test</div>;
    };
    expect(() => render(<TestComponent />)).toThrowError("useUser must be used within a UserProvider");
  });

  it("should fill user state with returned values from getUserFromLocalStorage", () => {
    const userState = mockUserState();

    mockGetUserFromLocalStorage.mockReturnValueOnce(userState);
    const TestComponent = () => {
      const { user } = useUser();
      return <div>{JSON.stringify(user)}</div>;
    };

    renderElement(<TestComponent />);

    expect(screen.getByText(JSON.stringify(userState))).toBeVisible();
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
      expect(screen.getByText(/admin/i)).toBeVisible();
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
});
