import {render} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {UserProvider} from "../../../app/components/providers/UserProvider";
import {UserAuthForm} from "../../../app/components/login/UserAuthForm";

const mockSetLoggingOut = jest.fn();
let mockLoggingOut = false;
jest.mock("../../../app/components/providers/RedirectOnLoginProvider", () => ({
    useRedirectOnLogin: () => ({
        setLoggingOut: mockSetLoggingOut,
        loggingOut: (() => mockLoggingOut)()
    })
}));

describe("UserAuthForm", () => {
    const renderElement = () => {
        return render(
            <MemoryRouter>
                <UserProvider>
                    <UserAuthForm></UserAuthForm>
                </UserProvider>
            </MemoryRouter>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("resets logging out", () => {
        mockLoggingOut = true;
        renderElement();
        expect(mockSetLoggingOut).toHaveBeenCalledWith(false);
    });

    it("does not reset logging out if not required", () => {
        mockLoggingOut = false;
        renderElement();
        expect(mockSetLoggingOut).not.toHaveBeenCalled();
    });
});
