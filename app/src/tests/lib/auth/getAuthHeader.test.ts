const mockGetBearerToken = jest.fn();
jest.mock("../../../lib/auth/getBearerToken", () => ({
    getBearerToken: () => mockGetBearerToken()
}));

import {getAuthHeader} from "../../../lib/auth/getAuthHeader";

it("getAuthHeader", () => {
    mockGetBearerToken.mockImplementation(() => "12345");
    const result = getAuthHeader();
    expect(result).toEqual({
        Authorization: "Bearer 12345"
    });
});