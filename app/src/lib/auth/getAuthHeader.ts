import {getBearerToken} from "./getBearerToken";

export const getAuthHeader = () => {
    const token = getBearerToken();
    return { Authorization: `Bearer ${token}` }
}
