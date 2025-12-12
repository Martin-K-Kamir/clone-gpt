import preview from "#.storybook/preview";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { FileBanner } from "./file-banner";

const meta = preview.meta({
    component: FileBanner,
    tags: ["autodocs"],
    args: {
        url: "https://example.com/document.pdf",
        name: "example-document.pdf",
        size: 1024 * 512, // 512 KB
        type: "pdf",
        download: false,
        isLoading: false,
        onClick: fn(),
        className: "bg-zinc-950",
    },
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        url: {
            control: "text",
            description: "The URL of the file",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        name: {
            control: "text",
            description: "The name of the file",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        size: {
            control: "number",
            description: "The size of the file in bytes",
            table: {
                type: {
                    summary: "number",
                },
            },
        },
        type: {
            control: "text",
            description: "The file type/extension (e.g., 'pdf', 'js', 'tsx')",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        download: {
            control: "boolean",
            description:
                "Whether the file can be downloaded (adds click handler)",
            table: {
                type: {
                    summary: "boolean",
                },
                defaultValue: {
                    summary: "false",
                },
            },
        },
        isLoading: {
            control: "boolean",
            description: "Whether the file is currently loading",
            table: {
                type: {
                    summary: "boolean",
                },
                defaultValue: {
                    summary: "false",
                },
            },
        },
    },
});

export const Default = meta.story();

export const PDF = meta.story({
    args: {
        url: "https://example.com/document.pdf",
        name: "important-document.pdf",
        size: 1024 * 2048, // 2 MB
        type: "pdf",
    },
});

export const Javascript = meta.story({
    args: {
        url: "https://example.com/script.js",
        name: "main.js",
        size: 1024 * 128, // 128 KB
        type: "js",
    },
});

export const Typescript = meta.story({
    args: {
        url: "https://example.com/component.tsx",
        name: "Button.tsx",
        size: 1024 * 64, // 64 KB
        type: "tsx",
    },
});

export const Python = meta.story({
    args: {
        url: "https://example.com/script.py",
        name: "data_processor.py",
        size: 1024 * 256, // 256 KB
        type: "py",
    },
});

export const CSV = meta.story({
    args: {
        url: "https://example.com/data.csv",
        name: "sales-data-2024.csv",
        size: 1024 * 1024, // 1 MB
        type: "csv",
    },
});

export const Excel = meta.story({
    args: {
        url: "https://example.com/spreadsheet.xlsx",
        name: "financial-report.xlsx",
        size: 1024 * 5120, // 5 MB
        type: "xlsx",
    },
});

export const Word = meta.story({
    args: {
        url: "https://example.com/document.docx",
        name: "meeting-notes.docx",
        size: 1024 * 1024 * 2, // 2 MB
        type: "docx",
    },
});

export const Zip = meta.story({
    args: {
        url: "https://example.com/archive.zip",
        name: "project-files.zip",
        size: 1024 * 1024 * 50, // 50 MB
        type: "zip",
    },
});

export const Markdown = meta.story({
    args: {
        url: "https://example.com/readme.md",
        name: "README.md",
        size: 1024 * 8, // 8 KB
        type: "md",
    },
});

export const JSON = meta.story({
    args: {
        url: "https://example.com/config.json",
        name: "package.json",
        size: 1024 * 4, // 4 KB
        type: "json",
    },
});

export const WithDownload = meta.story({
    args: {
        url: "https://example.com/downloadable.pdf",
        name: "downloadable-file.pdf",
        size: 1024 * 1024, // 1 MB
        type: "pdf",
        download: true,
    },
});

WithDownload.test(
    "should trigger download when clicked",
    async ({ canvas, step }) => {
        const fileUrl = "https://example.com/downloadable.pdf";
        let fetchCalled = false;
        let downloadLinkCreated = false;

        // Mock fetch to track if download was triggered
        const originalFetch = window.fetch;
        window.fetch = async (input: RequestInfo | URL) => {
            if (typeof input === "string" && input === fileUrl) {
                fetchCalled = true;
                return new Response(
                    new Blob(["test"], { type: "application/pdf" }),
                    {
                        status: 200,
                        headers: { "Content-Type": "application/pdf" },
                    },
                );
            }
            return originalFetch(input);
        };

        // Track if download link is created
        const originalCreateElement = document.createElement.bind(document);
        document.createElement = function (
            tagName: string,
            options?: ElementCreationOptions,
        ) {
            const element = originalCreateElement(tagName, options);
            if (tagName === "a") {
                downloadLinkCreated = true;
                // Prevent actual download
                element.click = function () {
                    // Mock click - don't actually download
                };
            }
            return element;
        };

        try {
            await step("Find and click the file banner", async () => {
                const banner = await canvas.findByText("downloadable-file.pdf");
                expect(banner).toBeVisible();
                await userEvent.click(banner);
            });

            await step("Verify download was triggered", async () => {
                await waitFor(
                    () => {
                        expect(fetchCalled).toBe(true);
                        expect(downloadLinkCreated).toBe(true);
                    },
                    { timeout: 3000 },
                );
            });
        } finally {
            // Cleanup
            window.fetch = originalFetch;
            document.createElement = originalCreateElement;
        }
    },
);

export const Loading = meta.story({
    args: {
        url: "https://example.com/loading.pdf",
        name: "loading-file.pdf",
        size: 1024 * 1024, // 1 MB
        type: "pdf",
        isLoading: true,
    },
});

export const LargeFile = meta.story({
    args: {
        url: "https://example.com/large-file.zip",
        name: "very-large-archive.zip",
        size: 1024 * 1024 * 1024 * 2, // 2 GB
        type: "zip",
    },
});

export const SmallFile = meta.story({
    args: {
        url: "https://example.com/tiny.txt",
        name: "tiny-file.txt",
        size: 256, // 256 bytes
        type: "txt",
    },
});

export const LongFileName = meta.story({
    args: {
        url: "https://example.com/file.pdf",
        name: "this-is-a-very-long-file-name-that-should-truncate-properly-in-the-ui.pdf",
        size: 1024 * 512, // 512 KB
        type: "pdf",
    },
});

export const UnknownType = meta.story({
    args: {
        url: "https://example.com/file.xyz",
        name: "unknown-file.xyz",
        size: 1024 * 128, // 128 KB
        type: "xyz",
    },
});
