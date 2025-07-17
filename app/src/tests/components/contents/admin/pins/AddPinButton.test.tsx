import { render, screen, waitFor, within } from "@testing-library/react";
import { AddPinButton } from "@components/contents/admin/pins/AddPinButton";
import userEvent from "@testing-library/user-event";
import * as fetch from "@lib/fetch";
import { server } from "@/msw/server";
import { rest } from "msw";
import appConfig from "@config/appConfig";
import { mockPacket, mockPacket2 } from "@/tests/mocks";
import { HttpStatus } from "@lib/types/HttpStatus";

const renderComponent = (mutate: any = vitest.fn()) => {
  return render(<AddPinButton mutate={mutate} />);
};

const selectFromDropdown = async (packetId: string) => {
  const buttonToOpenDropdown = screen.getAllByRole("combobox")[0];
  userEvent.click(buttonToOpenDropdown);

  const searchInput = screen.getByPlaceholderText("Search packet IDs...");
  userEvent.type(searchInput, packetId);

  const optionsMenu = screen.getByRole("group");
  userEvent.click(within(optionsMenu).getByText(new RegExp(packetId)));
};

describe("AddPinButton", () => {
  const fetcherSpy = vitest.spyOn(fetch, "fetcher");

  it("should open dialog on click with form", async () => {
    renderComponent();
    userEvent.click(screen.getByRole("button", { name: /add pin/i }));

    await waitFor(() => {
      expect(screen.getByText(/packet id/i)).toBeVisible();
      expect(screen.queryByRole("button", { name: "Add" })).toBeInTheDocument();
    });
  });

  it("should close dialog and clear form on cancel button click", async () => {
    renderComponent();
    const dialogTrigger = screen.getByRole("button", { name: /add pin/i });
    userEvent.click(dialogTrigger);

    expect(screen.getByRole("button", { name: "Add" })).toBeVisible();
    expect(screen.queryByText(`From packet group: ‘${mockPacket.name}’`)).not.toBeInTheDocument();
    await selectFromDropdown(mockPacket.id);
    expect(screen.getByText(`From packet group: ‘${mockPacket.name}’`)).toBeVisible();

    userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.queryByRole("button", { name: "Add" })).not.toBeInTheDocument();
    expect(screen.queryByText(`From packet group: ‘${mockPacket.name}’`)).not.toBeInTheDocument();

    userEvent.click(dialogTrigger);

    expect(screen.getByRole("button", { name: "Add" })).toBeVisible();
    expect(screen.queryByText(`From packet group: ‘${mockPacket.name}’`)).not.toBeInTheDocument();
  });

  it("should close dialog, reset form, call mutate on successful form submission", async () => {
    server.use(
      rest.get(`${appConfig.apiUrl()}/pins/packets`, (req, res, ctx) => {
        return res(ctx.json([mockPacket]));
      })
    );

    const mutate = vitest.fn();
    renderComponent(mutate);

    const dialogTrigger = screen.getByRole("button", { name: /add pin/i });
    userEvent.click(dialogTrigger);

    await selectFromDropdown(mockPacket2.id);

    await waitFor(() => {
      expect(screen.getByText(`From packet group: ‘${mockPacket2.name}’`)).toBeVisible();
    });

    userEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(fetcherSpy).toHaveBeenCalledWith({
        url: `${appConfig.apiUrl()}/pins`,
        body: { packetId: mockPacket2.id },
        method: "POST"
      });
    });
    expect(mutate).toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Add" })).not.toBeInTheDocument();

    userEvent.click(dialogTrigger);

    expect(screen.getByRole("button", { name: "Add" })).toBeVisible();
    expect(screen.queryByText(`From packet group: ‘${mockPacket2.name}’`)).not.toBeInTheDocument();
  });

  it("should display error message when fetch fails with bad request", async () => {
    const errorMessage = "That request was bad.";
    server.use(
      rest.post(`${appConfig.apiUrl()}/pins`, async (req, res, ctx) => {
        return res(ctx.status(HttpStatus.BadRequest), ctx.json({ error: { detail: errorMessage } }));
      })
    );
    renderComponent();

    userEvent.click(screen.getByRole("button", { name: /add pin/i }));
    await selectFromDropdown(mockPacket2.id);
    userEvent.click(screen.getByRole("button", { name: "Add" }));

    waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeVisible();
    });
  });

  it("should display error message when fetch fails with not found", async () => {
    const errorMessage = "There's nothing here.";
    server.use(
      rest.post(`${appConfig.apiUrl()}/pins`, async (req, res, ctx) => {
        return res(ctx.status(HttpStatus.NotFound), ctx.json({ error: { detail: errorMessage } }));
      })
    );
    renderComponent();

    userEvent.click(screen.getByRole("button", { name: /add pin/i }));
    await selectFromDropdown(mockPacket2.id);

    await waitFor(() => {
      userEvent.click(screen.getByRole("button", { name: "Add" }));
    });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeVisible();
    });
  });

  it("should display error message when fetch fails with unexpected error", async () => {
    server.use(
      rest.post(`${appConfig.apiUrl()}/pins`, async (req, res, ctx) => {
        return res(ctx.status(HttpStatus.InternalServerError));
      })
    );
    renderComponent();

    userEvent.click(screen.getByRole("button", { name: /add pin/i }));
    await selectFromDropdown(mockPacket2.id);
    userEvent.click(screen.getByRole("button", { name: "Add" }));

    waitFor(() => {
      expect(screen.getByText(/an unexpected error occurred. please try again/i)).toBeVisible();
    });
  });
});
