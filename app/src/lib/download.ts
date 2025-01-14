import { getAuthHeader } from "./auth/getAuthHeader";

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
  const fileUrl = await getFileObjectUrl(url, filename);
  const fileLink = document.createElement("a");
  fileLink.href = fileUrl;
  fileLink.setAttribute("download", filename);
  document.body.appendChild(fileLink);
  fileLink.click();
  document.body.removeChild(fileLink);
  window.URL.revokeObjectURL(fileUrl);
};
