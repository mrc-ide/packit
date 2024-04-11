import { PacketErrorBody } from "../types";
import { getAuthHeader } from "./auth/getAuthHeader";
import { ApiError } from "./errors";

export interface Fetcher {
  url: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  json?: boolean;
  noAuth?: boolean;
}

export const fetcher = async ({ url, method = "GET", body, noAuth }: Fetcher) => {
  const res = await fetch(url, {
    method,
    ...(body && { body: JSON.stringify(body) }),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(!noAuth && getAuthHeader())
    }
  });
  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : null;

  if (res.ok) {
    return data;
  }

  const packetErrorMessage = (data as PacketErrorBody)?.error?.detail;
  throw new ApiError(packetErrorMessage, res.status);
};
