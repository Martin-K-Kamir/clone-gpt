export function createImageFileFromDataURL(
    dataURL: string,
    filename: string,
    mimeType: string,
): File {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || mimeType;
    const bstr = atob(arr[1] || "");
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}

export function createColoredImageFile(
    color: string,
    filename: string,
    width: number = 100,
    height: number = 100,
): File {
    const imageCanvas = document.createElement("canvas");
    imageCanvas.width = width;
    imageCanvas.height = height;
    const ctx = imageCanvas.getContext("2d");
    if (ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
    }
    const dataURL = imageCanvas.toDataURL("image/png");
    return createImageFileFromDataURL(dataURL, filename, "image/png");
}

export function createColoredImageFiles(
    colors: string[] = ["#FF0000", "#0000FF", "#00FF00"],
    filenames?: string[],
): File[] {
    return colors.map((color, index) =>
        createColoredImageFile(
            color,
            filenames?.[index] || `${color.replace("#", "")}.png`,
        ),
    );
}

export function createTextFile(
    content: string,
    filename: string = "test.txt",
): File {
    return new File([content], filename, { type: "text/plain" });
}

export function createPDFFile(filename: string = "test.pdf"): File {
    const pdfContent =
        "%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\ntrailer\n<<\n/Size 1\n/Root 1 0 R\n>>\nstartxref\n9\n%%EOF";
    return new File([pdfContent], filename, { type: "application/pdf" });
}
