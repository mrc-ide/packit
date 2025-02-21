import { getAuthHeader } from "./auth/getAuthHeader";
import appConfig from "../config/appConfig";
import { FileMetadata } from "../types";

export const getZipUrl = (packetId: string, files: FileMetadata[]) => {
  const paths = files.map((file) => file.path);

  return `${appConfig.apiUrl()}/packets/${packetId}/zip?paths=${encodeURIComponent(paths.join(","))}`;
};

export const getFileUrl = (file: FileMetadata, packetId: string, inline = false) =>
  `${appConfig.apiUrl()}/packets/${packetId}/file?hash=${file.hash}&filename=${file.path}&inline=${inline}`;

export const getFileOttUrl = (file: FileMetadata, packetId: string) =>
  `${appConfig.apiUrl()}/packets/${packetId}/file/ott?path=${file.path}`;

export const getFilePublicUrl = (file: FileMetadata, packetId: string, token: string, inline = false) =>
  `${appConfig.apiUrl()}/packets/${packetId}/public?hash=${file.hash}&filename=${
    file.path
  }&token=${token}&inline=${inline}`;

export const getFileObjectUrl = async (url: string, filename: string) => {
  const headers = getAuthHeader();
  const res = await fetch(url, { method: "GET", headers });

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
  const fileLink = document.createElement("a");
  fileLink.href = url;
  fileLink.setAttribute("download", filename);
  document.body.appendChild(fileLink);
  fileLink.click();
  document.body.removeChild(fileLink);
};
