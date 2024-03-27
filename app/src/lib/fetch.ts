import { getAuthHeader } from "./auth/getAuthHeader";
import { ApiError } from "./errors";

export interface Fetcher {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  json?: boolean;
  noAuth?: boolean;
}

export const fetcher = async ({ url, method = "GET", json = true, body, noAuth }: Fetcher) => {
  const res = await fetch(url, {
    method,
    ...(body && { body: JSON.stringify(body) }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(!noAuth && getAuthHeader())
    }
  });

  if (!res.ok) {
    throw new ApiError("API error", res.status);
  }

  if (json) {
    const data = await res.json();
    return data;
  }
};
