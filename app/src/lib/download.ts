import { getAuthHeader } from "./auth/getAuthHeader";
import appConfig from "../config/appConfig";
import { FileMetadata } from "../types";

export const getFileUrl = (file: FileMetadata, packetId: string, inline?: boolean) =>
  `${appConfig.apiUrl()}/packets/file/${packetId}?hash=${file.hash}&filename=${file.path}&inline=${inline}`;

export const baseZipUrl = (packetName: string, packetId: string) =>
  `${appConfig.apiUrl()}/packets/${packetName}/${packetId}/zip`;

export const getFileObjectUrl = async (url: string, filename: string) => {
  const headers = getAuthHeader();
  const res = await fetch(url, {
    method: "GET",
    headers
  });

  if (!res.ok) {
    const json = await res.json();
    const msg = json.error?.detail ? `Error: ${json.error.detail}` : `Error downloading ${filename}`;
    throw new Error(msg);
  }

  const blob = await res.blob().catch(() => {
    throw new Error("Error retrieving data from response");
  });
  return URL.createObjectURL(blob);
};

export const download = async (url: string, filename: string) => {
  const fileObjectUrl = await getFileObjectUrl(url, filename);
  const fileLink = document.createElement("a");
  fileLink.href = fileObjectUrl;
  fileLink.setAttribute("download", filename);
  document.body.appendChild(fileLink);
  fileLink.click();
  document.body.removeChild(fileLink);
  window.URL.revokeObjectURL(fileObjectUrl);
};
