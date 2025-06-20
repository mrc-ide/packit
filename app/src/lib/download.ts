import { getAuthHeader } from "./auth/getAuthHeader";
import appConfig from "../config/appConfig";
import { FileMetadata } from "../types";

const streamFileUrl = (packetId: string, file: FileMetadata, token: string, filename: string, inline = false) => {
  const url = new URL(`${appConfig.apiUrl()}/packets/${packetId}/file`, window.location.href);
  url.searchParams.append("path", file.path);
  url.searchParams.append("token", token);
  url.searchParams.append("filename", filename);
  url.searchParams.append("inline", inline.toString());
  return url.toString();
};

const streamZipUrl = (packetId: string, files: FileMetadata[], token: string, filename: string, inline = false) => {
  const url = new URL(`${appConfig.apiUrl()}/packets/${packetId}/files/zip`, window.location.href);
  files.forEach((file) => url.searchParams.append("paths", file.path));
  url.searchParams.append("token", token);
  url.searchParams.append("filename", filename);
  url.searchParams.append("inline", inline.toString());
  return url.toString();
};

const getOneTimeToken = async (packetId: string, files: FileMetadata[], filename: string) => {
  const url = new URL(`${appConfig.apiUrl()}/packets/${packetId}/files/token`, window.location.href);
  files.forEach((file) => url.searchParams.append("paths", file.path));

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: getAuthHeader()
  });
  const json = await res.json();

  if (!res.ok) {
    const msg = json.error?.detail ? `Error: ${json.error.detail}` : `Error retrieving token for ${filename}`;
    throw new Error(msg);
  }

  return json.id;
};

// Fetch a file and pack it into a blob that is stored in the browser’s memory at a URL, until revoked.
export const getFileObjectUrl = async (file: FileMetadata, packetId: string, filename: string, inline = true) => {
  const token = await getOneTimeToken(packetId, [file], filename);
  const res = await fetch(streamFileUrl(packetId, file, token, filename, inline), { method: "GET" });
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

// Download files using the browser’s native download manager, triggered by using an <a> tag with a 'download' attribute
export const download = async (files: FileMetadata[], packetId: string, filename: string, preferZip = false) => {
  const token = await getOneTimeToken(packetId, files, filename);
  const fileLink = document.createElement("a");
  // Do a zip download if there are multiple files or if the file is larger than 1MB, or if zip was requested.
  if (files.length > 1 || files[0].size > 1000000 || preferZip) {
    fileLink.href = streamZipUrl(packetId, files, token, filename, false);
  } else {
    fileLink.href = streamFileUrl(packetId, files[0], token, filename, false);
  }
  fileLink.setAttribute("download", filename);
  document.body.appendChild(fileLink);
  fileLink.click();
  document.body.removeChild(fileLink);
};
