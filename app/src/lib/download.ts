import { getAuthHeader } from "./auth/getAuthHeader";
import appConfig from "../config/appConfig";
import { FileMetadata } from "../types";

const filesTokenUrl = (files: FileMetadata[], packetId: string) => {
  const paths = files.map((file) => file.path);

  return `${appConfig.apiUrl()}/packets/${packetId}/files/token?paths=${encodeURIComponent(paths.join(","))}`;
};

const constructFilesUrl = (
  packetId: string,
  files: FileMetadata[],
  token: string,
  filename: string,
  inline = false
) => {
  const paths = files.map((file) => file.path);

  return `${appConfig.apiUrl()}/packets/${packetId}/files?paths=${encodeURIComponent(
    paths.join(",")
  )}&token=${token}&filename=${filename}&inline=${inline}`;
};

export const browserDownload = async (url: string, filename: string) => {
  const fileLink = document.createElement("a");
  fileLink.href = url;
  fileLink.setAttribute("download", filename);
  document.body.appendChild(fileLink);
  fileLink.click();
  document.body.removeChild(fileLink);
};

const getToken = async (packetId: string, files: FileMetadata[], filename: string) => {
  const oneTimeTokenUrl = filesTokenUrl(files, packetId);
  const headers = getAuthHeader();
  const tokenResponse = await fetch(oneTimeTokenUrl, { method: "POST", headers });
  const tokenJson = await tokenResponse.json();

  if (!tokenResponse.ok) {
    const msg = tokenJson.error?.detail ? `Error: ${tokenJson.error.detail}` : `Error downloading ${filename}`;
    throw new Error(msg);
  }

  return tokenJson.id;
};

export const getFileDownloadUrl = async (file: FileMetadata, packetId: string, filename: string, inline = false) => {
  const token = await getToken(packetId, [file], filename);

  return constructFilesUrl(packetId, [file], token, filename, inline);
};

export const download = async (file: FileMetadata, packetId: string, filename: string = file.path) => {
  const url = await getFileDownloadUrl(file, packetId, filename);

  await browserDownload(url, filename).catch((e) => alert("I caught an error semi gracefully :)"));
};

export const zipDownload = async (files: FileMetadata[], packetId: string, filename: string) => {
  const token = await getToken(packetId, files, filename);
  const url = constructFilesUrl(packetId, files, token, filename);

  await browserDownload(url, filename).catch((e) => alert("I caught an error semi gracefully :)"));
};

export const getFileObjectUrl = async (url: string, filename: string) => {
  const res = await fetch(url, { method: "GET" });

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
