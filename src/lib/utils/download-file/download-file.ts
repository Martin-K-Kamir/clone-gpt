export function downloadFile(
    data: string | ArrayBuffer,
    filename: string,
    mimeType: string,
): boolean {
    try {
        const blob = new Blob([data], { type: mimeType });
        const link = document.createElement("a");

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            return true;
        } else {
            console.error("Download not supported in this browser");
            return false;
        }
    } catch (error) {
        console.error("Failed to download file:", error);
        return false;
    }
}
