import {act, render, screen, waitFor, waitForOptions} from "@testing-library/react";
import { DeviceActivation } from "../../../app/components/login";
import userEvent from "@testing-library/user-event";
import { server } from "../../../msw/server";
import { rest } from "msw";
import appConfig from "../../../config/appConfig";
import * as fetch from "../../../lib/fetch";

describe("DeviceActivation", () => {
  //const fetcherSpy = jest.spyOn(fetch, "fetcher");s

  const renderComponent = () => {
    render(<DeviceActivation/>);
  };

  const getButton = () => screen.getByRole("button", { name: /Continue/ });
  const getTextBox = () => screen.getByRole("textbox", {});

  const successText = /Success! Code is activated - you can now access Packit API from your console./;

  beforeEach(() => {
    jest.clearAllMocks();
    document.elementFromPoint = (x, y) => null;
  });

  it("can submit valid code and see success message", async () => {
    await renderComponent();
    const button = getButton();
    const textbox = getTextBox();
    expect(button).not.toBeEnabled();
    expect(screen.queryByText(successText)).toBeNull;
    expect(textbox).toHaveFocus();
    userEvent.type(textbox, "ABCD-EFGH");
    await waitFor(() => {
      expect(button).toBeEnabled();
    });

    userEvent.click(button);

    await waitFor(() => {
      expect(screen.queryByText(successText)).toBeInTheDocument();
    });
    expect(textbox).not.toBeInTheDocument();
    expect(button).not.toBeInTheDocument();
  });

  it("can submit invalid code and see error message", async () => {
    server.use(
      rest.post(`${appConfig.apiUrl()}/deviceAuth/validate`, (req, res, ctx) => {
        return res(ctx.status(400), ctx.json({ error: { detail: "test_error" } }));
      })
    );
    renderComponent();
    const button = getButton();
    const textbox = getTextBox();
    const errorText = /Code has expired or is not recognised./;
    expect(screen.queryByText(errorText)).toBeNull;
    userEvent.type(textbox, "ABCD-EFGH");
    await waitFor(() => {
      expect(button).toBeEnabled();
    });
    userEvent.click(button);
    await waitFor(() => {
      expect(screen.queryByText(errorText)).toBeInTheDocument();
    });
    expect(textbox).toBeInTheDocument();
    // should have cleared text value
    expect(textbox).toHaveValue("");
    expect(button).toBeInTheDocument();
  });

  /*it("can see error message on unexpected status code", async () => {
    server.use(
      rest.post(`${appConfig.apiUrl()}/deviceAuth/validate`, (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: { detail: "test_error" } }));
      })
    );
    renderComponent();
    const button = getButton();
    const textbox = getTextBox();
    const errorText = /An unexpected error occurred./;
    expect(screen.queryByText(errorText)).toBeNull;
    userEvent.type(textbox, "ABCD-EFGH");
    userEvent.click(button);
    await waitFor(() => {
      expect(screen.queryByText(errorText)).toBeInTheDocument();
    });
    expect(textbox).toBeInTheDocument();
    expect(textbox).toHaveValue("");
    expect(button).toBeInTheDocument();
  });

  it("can press Enter to submit code, but only when it is complete", async () => {
    renderComponent();
    const textbox = getTextBox();
    userEvent.type(textbox, "ABCD-{enter}");
    // code should not have been submitted
    await expect(screen.findByText(successText, {}, { timeout: 500 })).rejects.toThrow();

    userEvent.type(textbox, "ABCD-EFGH{enter}");
    // code should have been submitted
    await waitFor(() => {
      expect(screen.queryByText(successText)).toBeInTheDocument();
    });
  });

  it("cannot enter invalid characters", () => {
    renderComponent();
    const textbox = getTextBox();
    userEvent.type(textbox, "A!1-_Bc");
    expect(textbox).toHaveValue("ABc");
  });

  it("lower case letters are converted to upper case on submit", async () => {
    renderComponent();
    const textbox = getTextBox();
    userEvent.type(textbox, "Abcd-Efgh{enter}");
    await waitFor(() => {
      expect(fetcherSpy).toHaveBeenCalledWith({
        url: `${appConfig.apiUrl()}/deviceAuth/validate`,
        body: {user_code: "ABCD-EFGH"},
        method: "POST"
      });
    });
  });*/
});
