export async function downloadBlob({
    src,
    name,
}: {
    src: string;
    name?: string;
}) {
    try {
        const response = await fetch(src);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = name ?? src;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(url);
    } catch {
        window.open(src, "_blank");
    }
}
