import {getAuthHeader} from "./auth/getAuthHeader";

export interface Fetcher {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  json?: boolean;
  authRequired?: boolean;
}

export const fetcher = async ({ url, method = "GET", json = true, body }: Fetcher) => {
  const res = await fetch(url, {
    method,
    ...(body && { body: JSON.stringify(body) }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  });

  if (!res.ok) {
    throw new Error("API error");
  }

  if (json) {
    const data = await res.json();
    return data;
  }
};
