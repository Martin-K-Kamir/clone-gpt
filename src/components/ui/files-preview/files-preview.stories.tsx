import preview from "#.storybook/preview";
import { expect, fireEvent, fn } from "storybook/test";

import { FilesPreview } from "./files-preview";

function createFile(name: string, content: string | Blob, type: string): File {
    const blob =
        typeof content === "string" ? new Blob([content], { type }) : content;
    return new File([blob], name, { type });
}

function createImageFile(name: string, width = 150, height = 150): File {
    // Create a simple colored image using data URL
    // This creates a 1x1 pixel PNG and scales it
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (ctx) {
        // Create a simple gradient image
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, "#3b82f6");
        gradient.addColorStop(1, "#8b5cf6");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    // Convert canvas to blob synchronously using data URL
    const dataUrl = canvas.toDataURL("image/png");
    const base64 = dataUrl.split(",")[1];
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "image/png" });
    return new File([blob], name, { type: "image/png" });
}

const meta = preview.meta({
    component: FilesPreview,
    tags: ["autodocs"],
    args: {
        previewFiles: [],
        isLoading: false,
        classNameFile: "bg-zinc-950",
        onFileRemove: fn(),
    },
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        previewFiles: {
            control: false,
            description: "Array of File objects to preview",
            table: {
                type: {
                    summary: "File[]",
                },
            },
        },
        isLoading: {
            control: "boolean",
            description: "Whether the files are currently loading",
            table: {
                type: {
                    summary: "boolean",
                },
                defaultValue: {
                    summary: "false",
                },
            },
        },
        onFileRemove: {
            control: false,
            description: "Callback function called when a file is removed",
            table: {
                type: {
                    summary: "(file: File) => void",
                },
            },
        },
        className: {
            control: "text",
            description: "Additional CSS classes for the container",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        classNameImageWrapper: {
            control: "text",
            description: "Additional CSS classes for the image wrapper",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        classNameFileWrapper: {
            control: "text",
            description: "Additional CSS classes for the file wrapper",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        classNameImage: {
            control: "text",
            description: "Additional CSS classes for the image",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        classNameFile: {
            control: "text",
            description: "Additional CSS classes for the file",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        classNameRemoveButton: {
            control: "text",
            description: "Additional CSS classes for the remove button",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
    },
});

export const Default = meta.story({
    args: {
        previewFiles: [
            createImageFile("photo.jpg"),
            createFile("document.pdf", "PDF content", "application/pdf"),
        ],
    },
});

Default.test(
    "should not be able to scroll or drag when there are few items",
    async ({ canvas }) => {
        const list = canvas.getByRole("list");

        const initialScrollLeft = list.scrollLeft;

        fireEvent.mouseDown(list, {
            clientX: 100,
            clientY: 0,
        });

        fireEvent.mouseMove(list, {
            clientX: 200,
            clientY: 0,
        });

        fireEvent.mouseUp(list);

        expect(list.scrollLeft).toBe(initialScrollLeft);
        expect(list).not.toHaveClass("cursor-grab");
    },
);

export const SingleImage = meta.story({
    args: {
        previewFiles: [createImageFile("photo.jpg")],
    },
});

SingleImage.test(
    "should call onFileRemove when a file is removed",
    async ({ canvas, userEvent, args }) => {
        const image = canvas.getByRole("listitem");
        await userEvent.hover(image);
        const removeButton = canvas.getByRole("button", {
            name: /remove file photo\.jpg/i,
            hidden: true,
        });
        await userEvent.click(removeButton);
        expect(args.onFileRemove).toHaveBeenCalledWith(args.previewFiles[0]);
    },
);

SingleImage.test(
    "should not be able to scroll or drag with a single item",
    async ({ canvas }) => {
        const list = canvas.getByRole("list");
        const initialScrollLeft = list.scrollLeft;

        fireEvent.mouseDown(list, {
            clientX: 100,
            clientY: 0,
        });

        fireEvent.mouseMove(list, {
            clientX: 200,
            clientY: 0,
        });

        fireEvent.mouseUp(list);

        expect(list.scrollLeft).toBe(initialScrollLeft);
    },
);

export const SingleDocument = meta.story({
    args: {
        previewFiles: [
            createFile("document.pdf", "PDF content", "application/pdf"),
        ],
    },
});

SingleDocument.test(
    "should call onFileRemove when a file is removed",
    async ({ canvas, userEvent, args }) => {
        const document = canvas.getByRole("listitem");
        await userEvent.hover(document);
        const removeButton = canvas.getByRole("button", {
            name: /remove file document\.pdf/i,
        });
        await userEvent.click(removeButton);
        expect(args.onFileRemove).toHaveBeenCalledWith(args.previewFiles[0]);
    },
);

export const MultipleFiles = meta.story({
    args: {
        previewFiles: [
            createImageFile("photo1.jpg"),
            createFile("document.pdf", "PDF content", "application/pdf"),
            createImageFile("photo2.png"),
            createFile(
                "spreadsheet.xlsx",
                "Excel content",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ),
            createFile("script.js", "console.log('Hello');", "text/javascript"),
        ],
    },
});

export const MultipleImages = meta.story({
    args: {
        previewFiles: [
            createImageFile("landscape.jpg"),
            createImageFile("portrait.png"),
            createImageFile("square.gif"),
            createImageFile("wide.jpg"),
        ],
    },
});

export const MultipleDocuments = meta.story({
    args: {
        previewFiles: [
            createFile("report.pdf", "PDF content", "application/pdf"),
            createFile(
                "data.xlsx",
                "Excel content",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ),
            createFile(
                "notes.docx",
                "Word content",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ),
            createFile("code.js", "JavaScript code", "text/javascript"),
            createFile("styles.css", "CSS styles", "text/css"),
            createFile("readme.md", "Markdown content", "text/markdown"),
        ],
    },
    decorators: [
        Story => (
            <div style={{ width: "800px", border: "1px solid red" }}>
                <Story />
            </div>
        ),
    ],
    parameters: {
        chromatic: { disableSnapshot: true },
    },
});

MultipleDocuments.test(
    "should be able to scroll through the list",
    async ({ canvas }) => {
        const list = canvas.getByRole("list");
        expect(list.scrollWidth).toBeGreaterThan(list.clientWidth);

        const initialScrollLeft = list.scrollLeft;

        fireEvent.wheel(list, {
            deltaY: 100,
        });

        expect(list.scrollLeft).toBeGreaterThan(initialScrollLeft);
    },
);

export const Loading = meta.story({
    args: {
        previewFiles: [
            createImageFile("loading-photo.jpg"),
            createFile("loading-doc.pdf", "PDF content", "application/pdf"),
        ],
        isLoading: true,
    },
});
