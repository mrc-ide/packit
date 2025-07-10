import { render, screen, waitFor } from "@testing-library/react";
import { DeletePinButton } from "@components/contents/admin/pins/DeletePinButton";
import userEvent from "@testing-library/user-event";
import * as fetch from "@lib/fetch";
import { server } from "@/msw/server";
import { rest } from "msw";
import appConfig from "@config/appConfig";
import { mockPacket } from "@/tests/mocks";
import { HttpStatus } from "@lib/types/HttpStatus";
import { PacketMetadata } from "@/types";

const renderComponent = (mutate: any = vitest.fn(), packet: PacketMetadata = mockPacket) => {
  return render(
    <DeletePinButton packet={packet} mutate={mutate} />
  );
}

describe("DeletePinButton", () => {
  const fetcherSpy = vitest.spyOn(fetch, "fetcher");

  it("should open dialog on click with form", async () => {
    renderComponent();
    userEvent.click(screen.getByTestId("unpinButton"));

    await waitFor(() => {
      expect(screen.getByText(
        /do you want to remove the pin on ‘parameters’/i
      )).toBeVisible();
    });
  });

  it("should close dialog on cancel button click", async () => {
    renderComponent();
    const dialogTrigger = screen.getByTestId("unpinButton");
    userEvent.click(dialogTrigger);

    expect(screen.queryByRole("button", { name: "Yes" })).toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.queryByRole("button", { name: "Yes" })).not.toBeInTheDocument();

    userEvent.click(dialogTrigger);
  });

  it("should close dialog and call mutate on successful form submission", async () => {
    const mutate = vitest.fn();
    renderComponent(mutate);

    const dialogTrigger = screen.getByTestId("unpinButton");
    userEvent.click(dialogTrigger);

    userEvent.click(screen.getByRole("button", { name: "Yes" }));

    await waitFor(() => {
      expect(fetcherSpy).toHaveBeenCalledWith({
        url: `${appConfig.apiUrl()}/pins`,
        body: { packetId: mockPacket.id },
        method: "DELETE"
      });
    });
    await waitFor(() => {
      expect(mutate).toHaveBeenCalled();
    })
    expect(screen.queryByRole("button", { name: "Yes" })).not.toBeInTheDocument();
  });

  it("should display error message when fetch fails with not found", async () => {
    const errorMessage = "There's nothing here.";
    server.use(
      rest.delete(`${appConfig.apiUrl()}/pins`, async (req, res, ctx) => {
        return res(ctx.status(HttpStatus.NotFound), ctx.json({ error: { detail: errorMessage } }));
      })
    );
    renderComponent();

    userEvent.click(screen.getByTestId("unpinButton"));
    userEvent.click(screen.getByRole("button", { name: "Yes" }));

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeVisible();
    });
  });

  it("should display error message when fetch fails with unexpected error", async () => {
    server.use(
      rest.delete(`${appConfig.apiUrl()}/pins`, async (req, res, ctx) => {
        return res(ctx.status(HttpStatus.InternalServerError));
      })
    );
    renderComponent();

    await waitFor(() => {
      userEvent.click(screen.getByTestId("unpinButton"));
    });
    await waitFor(() => {
      userEvent.click(screen.getByRole("button", { name: "Yes" }));
    });
    await waitFor(() => {
      expect(screen.getByText(/an unexpected error occurred. please try again/i)).toBeVisible();
    });
  });
});
