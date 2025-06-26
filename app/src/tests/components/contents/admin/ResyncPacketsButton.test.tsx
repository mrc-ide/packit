import * as fetch from "../../../../lib/fetch";
import {render, screen, waitFor} from "@testing-library/react";
import {ResyncPacketsButton} from "../../../../app/components/contents/admin/ResyncPacketsButton";
import userEvent from "@testing-library/user-event";
import {server} from "../../../../msw/server";
import {rest} from "msw";
import {HttpStatus} from "../../../../lib/types/HttpStatus";
import appConfig from "../../../../config/appConfig";

describe("ResyncPacketsButton", () => {
    const fetcherSpy = jest.spyOn(fetch, "fetcher");

    const renderComponent = () => render(<ResyncPacketsButton />);

    afterAll(() => {
        jest.clearAllMocks();
    });

    it("makes resync request when button is pressed", async () => {
        renderComponent();
        const button = screen.getByRole("button", { name: "Resync packets" });
        userEvent.click(button);
        await waitFor(() => {
            expect(fetcherSpy).toHaveBeenCalledWith({
                url: `${appConfig.apiUrl()}/packets/resync`,
                method: "POST"
            });
        });
    });

    it("shows error", async () => {
        fetcherSpy.mockImplementation(() => {
            throw Error("test error");
        });

        renderComponent();
        const button = screen.getByRole("button", { name: "Resync packets" });
        userEvent.click(button);
        await waitFor(() => {
            expect(screen.getByText(/Failed to resync. Please try again./)).toBeInTheDocument();
        });
    });

    //it("disables button and shows progress message while request is pending");
});