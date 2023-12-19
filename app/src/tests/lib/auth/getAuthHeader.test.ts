import {getAuthHeader} from "../../../lib/auth/getAuthHeader";

jest.mock("../../../lib/auth/getBearerToken", () => ({
    getBearerToken: () => "12345"
}));

it("getAuthHeader", () => {
    const result = getAuthHeader();
    expect(result).toEqual({
        Authorization: "Bearer 12345"
    });
});
