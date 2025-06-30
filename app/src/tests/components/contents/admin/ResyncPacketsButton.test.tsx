import * as fetch from "../../../../lib/fetch";
import { render, screen, waitFor } from "@testing-library/react";
import { ResyncPacketsButton } from "../../../../app/components/contents/admin/ResyncPacketsButton";
import userEvent from "@testing-library/user-event";
import appConfig from "../../../../config/appConfig";
import {Toaster} from "sonner";

describe("ResyncPacketsButton", () => {
  const fetcherSpy = jest.spyOn(fetch, "fetcher");

  const renderComponent = () => render(
    <>
      <ResyncPacketsButton />
      <Toaster />
    </>
  );

  afterAll(() => {
    jest.resetAllMocks();
  });

  const getButton = () => screen.getByRole("button", { name: "Resync packets" });

  it("makes resync request when button is pressed, and shows toast on success", async () => {
    renderComponent();
    const button = getButton();
    userEvent.click(button);
    await waitFor(() => {
      expect(fetcherSpy).toHaveBeenCalledWith({
        url: `${appConfig.apiUrl()}/packets/resync`,
        method: "POST"
      });
    });
    await waitFor(() => {
      expect(screen.getAllByText(/Resync packets completed successfully/i)[0]).toBeVisible();
    });
  });

  it("shows error", async () => {
    fetcherSpy.mockImplementation(() => {
      throw Error("test error");
    });

    renderComponent();
    const button = getButton();
    userEvent.click(button);
    await waitFor(() => {
      expect(screen.getByText(/Failed to resync. Please try again./)).toBeInTheDocument();
    });
  });

  it("disables button while request is pending", async () => {
    renderComponent();
    const button = getButton();
    userEvent.click(button);
    await waitFor(() => {
      expect(button).toBeDisabled();
    });
    await waitFor(() => {
      expect(button).toBeEnabled();
    });
  });
});
