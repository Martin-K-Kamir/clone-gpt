import {
    MARKDOWN_BLOCKQUOTES,
    MARKDOWN_CODE_BLOCK_JAVASCRIPT,
    MARKDOWN_CODE_BLOCK_PYTHON,
    MARKDOWN_CODE_BLOCK_TYPESCRIPT,
    MARKDOWN_COMPLEX_EXAMPLE,
    MARKDOWN_DEFAULT,
    MARKDOWN_HEADINGS,
    MARKDOWN_HORIZONTAL_RULE,
    MARKDOWN_IMAGES_DISABLED,
    MARKDOWN_LINK_CUSTOM,
    MARKDOWN_LINK_GITHUB,
    MARKDOWN_LINK_REACT,
    MARKDOWN_LISTS,
    MARKDOWN_MIXED_CONTENT,
    MARKDOWN_TABLE,
    MARKDOWN_TEXT_FORMATTING,
    MARKDOWN_WITH_IMAGES,
} from "#.storybook/lib/mocks/markdown";
import { getCodeBlockByLanguage } from "#.storybook/lib/utils/elements";
import {
    setupClipboardMock,
    setupClipboardMockWithFallback,
    setupDownloadLinkTracking,
    waitForDropdownMenu,
    waitForDropdownMenuItemByText,
} from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect, waitFor } from "storybook/test";

import { cn } from "@/lib/utils";

import { Markdown } from "./markdown";

const meta = preview.meta({
    component: Markdown,
    parameters: {
        a11y: {
            disable: true,
        },
    },
    decorators: [
        Story => (
            <div
                className={cn(
                    "prose bg-zinc-925 p rose-zinc dark:prose-invert w-full max-w-full gap-2 rounded-2xl p-4 text-zinc-50 [&:not(pre)>code]:bg-zinc-800 [&_pre:has(>div)]:!p-0 [&_pre]:rounded-2xl [&_pre]:!p-6",
                    "prose-inline-code:bg-zinc-700 prose-inline-code:px-1 prose-inline-code:py-0.5 prose-inline-code:rounded-md prose-inline-code:text-zinc-50 prose-inline-code:font-medium",
                    "[&_p:empty]:m-0 [&_p:has(~p:empty)]:mb-0 [&_p:last-of-type_img]:mb-0",
                    "prose-img:rounded-lg prose-img:max-w-full prose-img:h-auto",
                )}
            >
                <Story />
            </div>
        ),
    ],
    argTypes: {
        content: {
            control: "text",
            description: "Markdown content to render",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        disableImageRendering: {
            control: "boolean",
            description: "Disable image rendering in markdown",
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

export const Default = meta.story({
    args: {
        content: MARKDOWN_DEFAULT,
    },
});

export const Headings = meta.story({
    args: {
        content: MARKDOWN_HEADINGS,
    },
});

export const TextFormatting = meta.story({
    args: {
        content: MARKDOWN_TEXT_FORMATTING,
    },
});

export const Lists = meta.story({
    args: {
        content: MARKDOWN_LISTS,
    },
});

export const CodeBlocks = meta.story({
    render: () => (
        <div className="space-y-6">
            <div>
                <Markdown content={MARKDOWN_CODE_BLOCK_JAVASCRIPT} />
            </div>
            <div>
                <Markdown content={MARKDOWN_CODE_BLOCK_TYPESCRIPT} />
            </div>
            <div>
                <Markdown content={MARKDOWN_CODE_BLOCK_PYTHON} />
            </div>
        </div>
    ),
});

CodeBlocks.test(
    "should be able to copy code block contents to clipboard",
    async ({ canvas, userEvent, step }) => {
        const clipboardMock = setupClipboardMock();

        try {
            await step("Find and click the copy button", async () => {
                // Find the first copy button (JavaScript code block)
                const copyButtons = canvas.getAllByRole("button", {
                    name: /copy/i,
                });
                expect(copyButtons.length).toBeGreaterThan(0);

                const copyButton = copyButtons[0];
                expect(copyButton).toBeInTheDocument();
                await userEvent.click(copyButton);
            });

            await step(
                "Verify code content was copied to clipboard",
                async () => {
                    // Wait for clipboard write to complete
                    await waitFor(
                        () => {
                            expect(
                                clipboardMock.flags.clipboardWriteTextCalled,
                            ).toBe(true);
                        },
                        { timeout: 3000 },
                    );

                    const blockCode = getCodeBlockByLanguage("javascript");
                    expect(blockCode).toBeInTheDocument();

                    expect(blockCode?.textContent?.trim()).toBe(
                        clipboardMock.flags.clipboardText.trim(),
                    );
                },
            );
        } finally {
            clipboardMock.cleanup();
        }
    },
);

export const Tables = meta.story({
    args: {
        content: MARKDOWN_TABLE,
    },
});

Tables.test(
    "should be able to copy table contents to clipboard",
    async ({ canvas, userEvent, step }) => {
        const clipboardMock = setupClipboardMockWithFallback({
            makeWriteFail: true,
        });

        try {
            await step("Find and click the copy button", async () => {
                const copyButton = canvas.getByRole("button", {
                    name: "Copy Table",
                });
                expect(copyButton).toBeInTheDocument();
                await userEvent.click(copyButton);
            });

            await step(
                "Verify table content was copied to clipboard",
                async () => {
                    // Wait for clipboard write to complete
                    await waitFor(
                        () => {
                            expect(
                                clipboardMock.flags.clipboardWriteTextCalled,
                            ).toBe(true);
                        },
                        { timeout: 3000 },
                    );

                    // Get the actual table element to extract expected textContent
                    const table = canvas.getByRole("table");
                    expect(table).toBeInTheDocument();

                    // The clipboard should contain the table's textContent
                    // which is all text nodes concatenated (without markdown formatting)
                    const expectedText = table.textContent || "";
                    expect(clipboardMock.flags.clipboardText).toBe(
                        expectedText,
                    );
                },
            );
        } finally {
            clipboardMock.cleanup();
        }
    },
);

Tables.test(
    "should be able to download table as CSV",
    async ({ canvas, userEvent, step }) => {
        const downloadTracking = setupDownloadLinkTracking();

        try {
            await step("Find and click the download button", async () => {
                const downloadButton = canvas.getByRole("button", {
                    name: "Download Table",
                });
                expect(downloadButton).toBeInTheDocument();
                await userEvent.click(downloadButton);
            });

            await step("Wait for dropdown menu to open", async () => {
                const menu = await waitForDropdownMenu();
                expect(menu).toBeInTheDocument();
            });

            await step("Find and click the CSV download option", async () => {
                const downloadAsCSVButton =
                    await waitForDropdownMenuItemByText(/download as csv/i);

                expect(downloadAsCSVButton).toBeInTheDocument();
                await userEvent.click(downloadAsCSVButton);
            });

            await step("Verify download was triggered", async () => {
                await waitFor(
                    () => {
                        expect(downloadTracking.flags.downloadLinkCreated).toBe(
                            true,
                        );
                        expect(downloadTracking.flags.downloadLinkClicked).toBe(
                            true,
                        );
                    },
                    { timeout: 3000 },
                );
            });
        } finally {
            downloadTracking.cleanup();
        }
    },
);

Tables.test(
    "should be able to download table as Excel",
    async ({ canvas, userEvent, step }) => {
        const downloadTracking = setupDownloadLinkTracking();

        try {
            await step("Find and click the download button", async () => {
                const downloadButton = canvas.getByRole("button", {
                    name: "Download Table",
                });
                expect(downloadButton).toBeInTheDocument();
                await userEvent.click(downloadButton);
            });

            await step("Wait for dropdown menu to open", async () => {
                const menu = await waitForDropdownMenu();
                expect(menu).toBeInTheDocument();
            });

            await step("Find and click the Excel download option", async () => {
                const downloadAsExcelButton =
                    await waitForDropdownMenuItemByText(/download as excel/i);

                expect(downloadAsExcelButton).toBeInTheDocument();
                await userEvent.click(downloadAsExcelButton);
            });

            await step("Verify download was triggered", async () => {
                await waitFor(
                    () => {
                        expect(downloadTracking.flags.downloadLinkCreated).toBe(
                            true,
                        );
                        expect(downloadTracking.flags.downloadLinkClicked).toBe(
                            true,
                        );
                    },
                    { timeout: 3000 },
                );
            });
        } finally {
            downloadTracking.cleanup();
        }
    },
);

export const Links = meta.story({
    render: () => (
        <div className="space-y-4">
            <Markdown content={MARKDOWN_LINK_GITHUB} />
            <Markdown content={MARKDOWN_LINK_REACT} />
            <Markdown content={MARKDOWN_LINK_CUSTOM} />
        </div>
    ),
});

export const Blockquotes = meta.story({
    args: {
        content: MARKDOWN_BLOCKQUOTES,
    },
});

export const HorizontalRule = meta.story({
    args: {
        content: MARKDOWN_HORIZONTAL_RULE,
    },
});

export const MixedContent = meta.story({
    args: {
        content: MARKDOWN_MIXED_CONTENT,
    },
});

export const WithImages = meta.story({
    args: {
        content: MARKDOWN_WITH_IMAGES,
    },
});

export const ImagesDisabled = meta.story({
    args: {
        content: MARKDOWN_IMAGES_DISABLED,
        disableImageRendering: true,
    },
});

export const ComplexExample = meta.story({
    args: {
        content: MARKDOWN_COMPLEX_EXAMPLE,
    },
});
