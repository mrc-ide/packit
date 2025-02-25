import { getAuthHeader } from "./auth/getAuthHeader";
import appConfig from "../config/appConfig";
import { FileMetadata } from "../types";

const filesToPathsParam = (files: FileMetadata[]) =>
  `paths=${encodeURIComponent(files.map((file) => file.path).join(","))}`;

const filesUrl = (packetId: string, files: FileMetadata[], token: string, filename: string, inline = false) =>
  `${appConfig.apiUrl()}/packets/${packetId}/files?` +
  `${filesToPathsParam(files)}&token=${token}&filename=${filename}&inline=${inline}`;

const getOneTimeToken = async (packetId: string, files: FileMetadata[], filename: string) => {
  const tokenResponse = await fetch(
    `${appConfig.apiUrl()}/packets/${packetId}/files/token?${filesToPathsParam(files)}`,
    {
      method: "POST",
      headers: getAuthHeader()
    }
  );
  const tokenJson = await tokenResponse.json();

  if (!tokenResponse.ok) {
    const msg = tokenJson.error?.detail ? `Error: ${tokenJson.error.detail}` : `Error retrieving token for ${filename}`;
    throw new Error(msg);
  }

  return tokenJson.id;
};

// Fetch a file and pack it into a blob that is stored in the browser’s memory at a URL, until revoked.
export const getFileObjectUrl = async (file: FileMetadata, packetId: string, filename: string, inline = true) => {
  const token = await getOneTimeToken(packetId, [file], filename);

  const res = await fetch(filesUrl(packetId, [file], token, filename, inline), { method: "GET" });
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
export const download = async (files: FileMetadata[], packetId: string, filename: string, inline = false) => {
  const token = await getOneTimeToken(packetId, files, filename);

  const fileLink = document.createElement("a");
  fileLink.href = filesUrl(packetId, files, token, filename, inline);
  fileLink.setAttribute("download", filename);
  document.body.appendChild(fileLink);
  fileLink.click();
  document.body.removeChild(fileLink);
};
