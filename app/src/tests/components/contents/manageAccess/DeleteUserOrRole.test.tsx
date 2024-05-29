import { render, screen, waitFor } from "@testing-library/react";
import { DeleteUserOrRole } from "../../../../app/components/contents/manageAccess/DeleteUserOrRole";
import * as fetch from "../../../../lib/fetch";
import userEvent from "@testing-library/user-event";
import appConfig from "../../../../config/appConfig";

describe("DeleteUserOrRole", () => {
  const fetcherSpy = jest.spyOn(fetch, "fetcher");
  it("should delete user on user delete", async () => {
    const mutate = jest.fn();
    const username = "testUser";
    render(<DeleteUserOrRole mutate={mutate} data={{ name: username, type: "user" }} />);

    userEvent.click(screen.getByRole("button", { name: "delete-user" }));
    await screen.findByText(/are you absolutely sure you want to delete testUser/i);
    userEvent.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(fetcherSpy).toHaveBeenCalledWith({
        url: `${appConfig.apiUrl()}/user/${username}`,
        method: "DELETE"
      });
    });
    expect(mutate).toHaveBeenCalledTimes(1);
  });

  it("should delete role on role delete", async () => {
    const mutate = jest.fn();
    const roleName = "testRole";
    render(<DeleteUserOrRole mutate={mutate} data={{ name: roleName, type: "role" }} />);

    userEvent.click(screen.getByRole("button", { name: "delete-role" }));
    await screen.findByText(/are you absolutely sure you want to delete testRole/i);
    userEvent.click(await screen.findByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(fetcherSpy).toHaveBeenCalledWith({
        url: `${appConfig.apiUrl()}/role/${roleName}`,
        method: "DELETE"
      });
    });
    expect(mutate).toHaveBeenCalledTimes(1);
  });
});
