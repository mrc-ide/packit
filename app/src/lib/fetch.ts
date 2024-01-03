import { getBearerToken } from "./auth/getBearerToken";

export interface Fetcher {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  json?: boolean;
  authRequired?: boolean;
}

export const fetcher = async ({ url, method = "GET", json = true, authRequired = false, body }: Fetcher) => {
  const token = authRequired ? getBearerToken() : null;

  const res = await fetch(url, {
    method,
    ...(body && { body: JSON.stringify(body) }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(authRequired && { Authorization: `Bearer ${token}` })
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
