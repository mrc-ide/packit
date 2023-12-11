import {getBearerToken} from "./getBearerToken";

export const download = async (url: string, filename: string, authRequired = true) => {
    const token = getBearerToken();


    // TODO: add lib method to add auth header if auth enabled (rename authRequired param and
    //  don't do check in component)
    // TODO: handle res error in lib method
    const headers = authRequired ? { Authorization: `Bearer ${token}` } : undefined;
    const res = await fetch(url, {
        method: "GET",
        headers,
    });

    if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error?.detail || `Error downloading ${filename}`);
    }

    const blob = await res.blob();
    const fileUrl = window.URL.createObjectURL(blob);
    const fileLink = document.createElement("a");
    fileLink.href = fileUrl;
    fileLink.setAttribute("download", filename);
    document.body.appendChild(fileLink);
    fileLink.click();
    document.body.removeChild(fileLink);
    URL.revokeObjectURL(fileUrl)

};
