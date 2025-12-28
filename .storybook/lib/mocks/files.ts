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

export type MockFileType =
    | "text"
    | "pdf"
    | "typescript"
    | "python"
    | "javascript"
    | "json"
    | "html"
    | "css"
    | "xml"
    | "java"
    | "cpp"
    | "c";

const FILE_TYPE_MIME_MAP: Record<MockFileType, string> = {
    text: "text/plain",
    pdf: "application/pdf",
    typescript: "text/typescript",
    python: "text/python",
    javascript: "text/javascript",
    json: "application/json",
    html: "text/html",
    css: "text/css",
    xml: "application/xml",
    java: "text/x-java-source",
    cpp: "text/x-c++src",
    c: "text/x-csrc",
};

const EXTENSION_TYPE_MAP: Record<string, MockFileType> = {
    txt: "text",
    pdf: "pdf",
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    py: "python",
    json: "json",
    html: "html",
    css: "css",
    xml: "xml",
    java: "java",
    cpp: "cpp",
    c: "c",
};

function getMimeTypeFromExtension(filename: string): string {
    const extension = filename.split(".").pop()?.toLowerCase() ?? "";
    const fileType = EXTENSION_TYPE_MAP[extension];
    return fileType ? FILE_TYPE_MIME_MAP[fileType] : "text/plain";
}

export function createFile(options: {
    filename: string;
    type?: MockFileType;
    content?: string;
    mimeType?: string;
}): File {
    const { filename, type, content, mimeType } = options;

    let finalMimeType: string;
    if (mimeType) {
        finalMimeType = mimeType;
    } else if (type) {
        finalMimeType = FILE_TYPE_MIME_MAP[type];
    } else {
        finalMimeType = getMimeTypeFromExtension(filename);
    }

    let finalContent: string;
    if (content !== undefined) {
        finalContent = content;
    } else if (type === "pdf") {
        finalContent =
            "%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\nxref\n0 1\ntrailer\n<<\n/Size 1\n/Root 1 0 R\n>>\nstartxref\n9\n%%EOF";
    } else if (type === "typescript") {
        finalContent = "// TypeScript file content";
    } else if (type === "python") {
        finalContent = "# Python file content";
    } else {
        finalContent = "file content";
    }

    return new File([finalContent], filename, { type: finalMimeType });
}

export function createMockFiles(
    files: Array<{
        filename: string;
        type?: MockFileType;
        content?: string;
        mimeType?: string;
    }>,
): File[] {
    return files.map((file, index) => {
        const content =
            file.content ??
            (file.type === "pdf" ? undefined : `content${index + 1}`);
        return createFile({
            filename: file.filename,
            type: file.type,
            content,
            mimeType: file.mimeType,
        });
    });
}

export const MOCK_FILES_MIXED: File[] = [
    createFile({ filename: "document.pdf", type: "pdf" }),
    createFile({ filename: "button.tsx", type: "typescript" }),
    createFile({ filename: "sum.js", type: "javascript" }),
];

export function createMockDataTransfer(files: File[] = []): DataTransfer {
    const dt = new DataTransfer();
    files.forEach(file => dt.items.add(file));
    return dt;
}
