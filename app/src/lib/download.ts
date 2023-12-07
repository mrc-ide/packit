import {getBearerToken} from "./getBearerToken";

export const download = async (url: string, filename: string) => {
    const token = getBearerToken();
    const blob = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`
        }
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
