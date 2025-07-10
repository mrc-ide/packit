import { render, screen, waitFor } from "@testing-library/react";
import { AddPinButton } from "@components/contents/admin/pins/AddPinButton";
import userEvent from "@testing-library/user-event";
import * as fetch from "@lib/fetch";
import { server } from "@/msw/server";
import { rest } from "msw";
import appConfig from "@config/appConfig";
import { mockPacket, mockPacket2, nonExistentPacketId } from "@/tests/mocks";
import { HttpStatus } from "@lib/types/HttpStatus";

const renderComponent = (mutate: any = vitest.fn()) => {
  return render(<AddPinButton mutate={mutate} />);
};

const typeIntoInput = async (value: string) => {
  const input = screen.getByLabelText(/packet id/i);
  // We have to wait for the input to become clickable (i.e. to lose its 'pointer-events: none' style)
  await waitFor(() => {
    userEvent.click(input);
  });
  userEvent.type(input, value);
};

describe("AddPinButton", () => {
  const fetcherSpy = vitest.spyOn(fetch, "fetcher");

  it("should open dialog on click with form", async () => {
    renderComponent();
    userEvent.click(screen.getByRole("button", { name: /add pin/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/packet id/i)).toBeVisible();
    });
  });

  it("should close dialog and clear form on cancel button click", async () => {
    renderComponent();
    const dialogTrigger = screen.getByRole("button", { name: /add pin/i });
    userEvent.click(dialogTrigger);

    await typeIntoInput(mockPacket.id);
    expect(screen.queryByRole("button", { name: "Add" })).toBeInTheDocument();

    userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    expect(screen.queryByRole("button", { name: "Add" })).not.toBeInTheDocument();

    userEvent.click(dialogTrigger);

    expect(screen.getByLabelText(/packet id/i)).toHaveValue("");
  });

  it("should validate the input as matching the packet id format", async () => {
    const mutate = vitest.fn();
    renderComponent(mutate);

    const dialogTrigger = screen.getByRole("button", { name: /add pin/i });
    userEvent.click(dialogTrigger);

    await typeIntoInput("incorrect-format-of-id");

    await waitFor(() => {
      userEvent.click(screen.getByRole("button", { name: "Add" }));
    });

    await waitFor(() => {
      expect(screen.getByText(/invalid packet id format/i)).toBeVisible();
    });

    expect(fetcherSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        url: `${appConfig.apiUrl()}/pins`
      })
    );
    expect(mutate).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: "Add" })).toBeInTheDocument();
  });

  it("should show error message when input is empty", async () => {
    renderComponent();
    userEvent.click(screen.getByRole("button", { name: /add pin/i }));

    userEvent.click(screen.getByRole("button", { name: "Add" }));

    await waitFor(() => {
      expect(screen.getByText(/string must contain at least 1 character/i)).toBeVisible();
    });
  });

  it("should validate that the id refers to an existing packet", async () => {
    renderComponent();

    const dialogTrigger = screen.getByRole("button", { name: /add pin/i });
    userEvent.click(dialogTrigger);

    await typeIntoInput(nonExistentPacketId);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(`no packet found with id ${nonExistentPacketId}`, "i"))).toBeVisible();
    });
  });

  it("should validate that the id refers to a packet that has not been pinned already", async () => {
    renderComponent();

    const dialogTrigger = screen.getByRole("button", { name: /add pin/i });
    userEvent.click(dialogTrigger);

    const input = screen.getByLabelText(/packet id/i);
    // We have to wait for the input to become clickable (i.e. to lose its 'pointer-events: none' style)
    await waitFor(() => {
      userEvent.click(input);
    });

    await typeIntoInput(mockPacket.id);

    await waitFor(() => {
      expect(screen.getByText(/packet is already pinned/i)).toBeVisible();
    });
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

    await typeIntoInput(mockPacket2.id);

    await waitFor(() => {
      expect(screen.getByText(/matching unpinned packet found: ‘aDifferentPacket’/i)).toBeVisible();
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

    expect(screen.getByLabelText(/packet id/i)).toHaveValue("");
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
    await typeIntoInput(mockPacket2.id);
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
    await typeIntoInput(mockPacket2.id);

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
    await typeIntoInput(mockPacket2.id);
    userEvent.click(screen.getByRole("button", { name: "Add" }));

    waitFor(() => {
      expect(screen.getByText(/an unexpected error occurred. please try again/i)).toBeVisible();
    });
  });
});
