import {
    MOCK_FILE_BANNER_CSV,
    MOCK_FILE_BANNER_EXCEL,
    MOCK_FILE_BANNER_JAVASCRIPT,
    MOCK_FILE_BANNER_JSON,
    MOCK_FILE_BANNER_LARGE,
    MOCK_FILE_BANNER_LOADING,
    MOCK_FILE_BANNER_LONG_NAME,
    MOCK_FILE_BANNER_MARKDOWN,
    MOCK_FILE_BANNER_NAME,
    MOCK_FILE_BANNER_PDF,
    MOCK_FILE_BANNER_PYTHON,
    MOCK_FILE_BANNER_SIZE_DEFAULT,
    MOCK_FILE_BANNER_SMALL,
    MOCK_FILE_BANNER_TYPESCRIPT,
    MOCK_FILE_BANNER_TYPE_PDF,
    MOCK_FILE_BANNER_UNKNOWN_TYPE,
    MOCK_FILE_BANNER_URL,
    MOCK_FILE_BANNER_WITH_DOWNLOAD,
    MOCK_FILE_BANNER_WORD,
    MOCK_FILE_BANNER_ZIP,
} from "#.storybook/lib/mocks/file-banner";
import { setupDownloadMock } from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { FileBanner } from "./file-banner";

const meta = preview.meta({
    component: FileBanner,
    args: {
        url: MOCK_FILE_BANNER_URL,
        name: MOCK_FILE_BANNER_NAME,
        size: MOCK_FILE_BANNER_SIZE_DEFAULT,
        type: MOCK_FILE_BANNER_TYPE_PDF,
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
    args: MOCK_FILE_BANNER_PDF,
});

export const Javascript = meta.story({
    args: MOCK_FILE_BANNER_JAVASCRIPT,
});

export const Typescript = meta.story({
    args: MOCK_FILE_BANNER_TYPESCRIPT,
});

export const Python = meta.story({
    args: MOCK_FILE_BANNER_PYTHON,
});

export const CSV = meta.story({
    args: MOCK_FILE_BANNER_CSV,
});

export const Excel = meta.story({
    args: MOCK_FILE_BANNER_EXCEL,
});

export const Word = meta.story({
    args: MOCK_FILE_BANNER_WORD,
});

export const Zip = meta.story({
    args: MOCK_FILE_BANNER_ZIP,
});

export const Markdown = meta.story({
    args: MOCK_FILE_BANNER_MARKDOWN,
});

export const JSON = meta.story({
    args: MOCK_FILE_BANNER_JSON,
});

export const WithDownload = meta.story({
    args: {
        ...MOCK_FILE_BANNER_WITH_DOWNLOAD,
        download: true,
    },
});

WithDownload.test(
    "should trigger download when clicked",
    async ({ canvas, step, args }) => {
        const downloadMock = setupDownloadMock({
            url: args.url,
            contentType: "application/pdf",
        });

        try {
            await step("Find and click the file banner", async () => {
                const banner = await canvas.findByText(args.name);
                expect(banner).toBeVisible();
                await userEvent.click(banner);
            });

            await step("Verify download was triggered", async () => {
                await waitFor(
                    () => {
                        expect(downloadMock.flags.fetchCalled).toBe(true);
                        expect(downloadMock.flags.downloadLinkCreated).toBe(
                            true,
                        );
                    },
                    { timeout: 3000 },
                );
            });
        } finally {
            downloadMock.cleanup();
        }
    },
);

export const Loading = meta.story({
    args: {
        ...MOCK_FILE_BANNER_LOADING,
        isLoading: true,
    },
});

export const LargeFile = meta.story({
    args: MOCK_FILE_BANNER_LARGE,
});

export const SmallFile = meta.story({
    args: MOCK_FILE_BANNER_SMALL,
});

export const LongFileName = meta.story({
    args: MOCK_FILE_BANNER_LONG_NAME,
});

export const UnknownType = meta.story({
    args: MOCK_FILE_BANNER_UNKNOWN_TYPE,
});
