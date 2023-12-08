import {getBearerToken} from "./getBearerToken";

export const download = async (url: string, filename: string, authRequired: boolean) => {
    throw new Error("Download errorx");
    const token = getBearerToken();
    const headers = authRequired ? { Authorization: `Bearer ${token}` } : undefined;
    const blob = await fetch(url, {
        method: "GET",
        headers,
    })
        .then(res => res.blob())
        .catch(() => {
            throw new Error("Download error");
        });

    if (blob) {
        const fileUrl = window.URL.createObjectURL(blob);
        const fileLink = document.createElement("a");
        fileLink.href = fileUrl;
        fileLink.setAttribute("download", filename);
        document.body.appendChild(fileLink);
        fileLink.click();
        document.body.removeChild(fileLink);
        URL.revokeObjectURL(fileUrl)
    }
};
