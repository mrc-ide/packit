import {getBearerToken} from "./getBearerToken";

export const getAuthHeader = () => {
    const token = getBearerToken();
    return token ? { Authorization: `Bearer ${token}` } : undefined;
}
