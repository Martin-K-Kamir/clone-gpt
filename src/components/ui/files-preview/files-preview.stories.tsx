import {
    createColoredImageFile,
    createFile,
} from "#.storybook/lib/mocks/files";
import preview from "#.storybook/preview";
import { expect, fireEvent, fn } from "storybook/test";

import { FilesPreview } from "./files-preview";

const meta = preview.meta({
    component: FilesPreview,
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
            createColoredImageFile("#FF0000", "photo.jpg"),
            createFile({
                filename: "document.pdf",
                type: "pdf",
                content: "PDF content",
            }),
        ],
    },
});

Default.test(
    "should not be able to scroll or drag when there are few items",
    async ({ canvas, userEvent }) => {
        const list = canvas.getByRole("list");

        const initialScrollLeft = list.scrollLeft;

        await userEvent.pointer({
            target: list,
            keys: "[MouseLeft>]",
            coords: { x: 100, y: 0 },
        });

        await userEvent.pointer({
            target: list,
            coords: { x: 200, y: 0 },
        });

        await userEvent.pointer({
            keys: "[/MouseLeft]",
        });

        expect(list.scrollLeft).toBe(initialScrollLeft);
        expect(list).not.toHaveClass("cursor-grab");
    },
);

export const SingleImage = meta.story({
    args: {
        previewFiles: [createColoredImageFile("#FF0000", "photo.jpg")],
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
    async ({ canvas, userEvent }) => {
        const list = canvas.getByRole("list");
        const initialScrollLeft = list.scrollLeft;

        await userEvent.pointer({
            target: list,
            keys: "[MouseLeft>]",
            coords: { x: 100, y: 0 },
        });

        await userEvent.pointer({
            target: list,
            coords: { x: 200, y: 0 },
        });

        await userEvent.pointer({
            keys: "[/MouseLeft]",
        });

        expect(list.scrollLeft).toBe(initialScrollLeft);
    },
);

export const SingleDocument = meta.story({
    args: {
        previewFiles: [
            createFile({
                filename: "document.pdf",
                type: "pdf",
                content: "PDF content",
            }),
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
            createColoredImageFile("#FF0000", "photo1.jpg"),
            createFile({
                filename: "document.pdf",
                type: "pdf",
                content: "PDF content",
            }),
            createColoredImageFile("#00FF00", "photo2.png"),
            createFile({
                filename: "spreadsheet.xlsx",
                content: "Excel content",
            }),
            createFile({
                filename: "script.js",
                content: "console.log('Hello');",
            }),
        ],
    },
});

export const MultipleImages = meta.story({
    args: {
        previewFiles: [
            createColoredImageFile("#FF0000", "landscape.jpg"),
            createColoredImageFile("#00FF00", "portrait.png"),
            createColoredImageFile("#0000FF", "square.gif"),
            createColoredImageFile("#FFFF00", "wide.jpg"),
        ],
    },
});

export const MultipleDocuments = meta.story({
    args: {
        previewFiles: [
            createFile({
                filename: "report.pdf",
                type: "pdf",
                content: "PDF content",
            }),
            createFile({
                filename: "data.xlsx",
                content: "Excel content",
            }),
            createFile({
                filename: "notes.docx",
                content: "Word content",
            }),
            createFile({
                filename: "code.js",
                content: "JavaScript code",
            }),
            createFile({
                filename: "styles.css",
                content: "CSS styles",
            }),
            createFile({
                filename: "readme.md",
                content: "Markdown content",
            }),
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
            createColoredImageFile("#FF0000", "loading-photo.jpg"),
            createFile({
                filename: "loading-doc.pdf",
                type: "pdf",
                content: "PDF content",
            }),
        ],
        isLoading: true,
    },
});
