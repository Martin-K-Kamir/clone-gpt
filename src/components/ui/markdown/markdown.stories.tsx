import preview from "#.storybook/preview";
import { expect, waitFor } from "storybook/test";

import { cn } from "@/lib/utils";

import { Markdown } from "./markdown";

const meta = preview.meta({
    component: Markdown,
    tags: ["autodocs"],
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
        content: "This is a **bold** text and this is *italic* text.",
    },
});

export const Headings = meta.story({
    args: {
        content: `# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6`,
    },
});

export const TextFormatting = meta.story({
    args: {
        content: `This is **bold text** and this is *italic text*.

You can also use ***bold and italic*** together.

Here's some \`inline code\` in a sentence.

And here's ~~strikethrough text~~.`,
    },
});

export const Lists = meta.story({
    args: {
        content: `### Unordered List

- First item
- Second item
- Third item
  - Nested item
  - Another nested item
- Fourth item

### Ordered List

1. First item
2. Second item
3. Third item
   1. Nested item
   2. Another nested item
4. Fourth item`,
    },
});

export const CodeBlocks = meta.story({
    render: () => (
        <div className="space-y-6">
            <div>
                <Markdown
                    content={`\`\`\`javascript
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet('World'));
\`\`\``}
                />
            </div>
            <div>
                <Markdown
                    content={`\`\`\`typescript
interface User {
    id: string;
    name: string;
    email: string;
}

const user: User = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
};
\`\`\``}
                />
            </div>
            <div>
                <Markdown
                    content={`\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
\`\`\``}
                />
            </div>
        </div>
    ),
});

CodeBlocks.test(
    "should be able to copy code block contents to clipboard",
    async ({ canvas, userEvent, step }) => {
        let clipboardText = "";
        let clipboardWriteTextCalled = false;

        // Mock clipboard API
        const originalWriteText = navigator.clipboard.writeText.bind(
            navigator.clipboard,
        );

        navigator.clipboard.writeText = async (text: string) => {
            clipboardWriteTextCalled = true;
            clipboardText = text;
            return originalWriteText(text);
        };

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
                            expect(clipboardWriteTextCalled).toBe(true);
                        },
                        { timeout: 3000 },
                    );

                    const blockCode = document.querySelector(
                        ".language-javascript",
                    );
                    expect(blockCode).toBeInTheDocument();

                    expect(blockCode?.textContent?.trim()).toBe(
                        clipboardText.trim(),
                    );
                },
            );
        } finally {
            // Cleanup
            navigator.clipboard.writeText = originalWriteText;
        }
    },
);

export const Tables = meta.story({
    args: {
        content: `| Name | Age | City | Occupation |
|------|-----|------|------------|
| John Doe | 28 | New York | Developer |
| Jane Smith | 32 | San Francisco | Designer |
| Bob Johnson | 45 | Chicago | Manager |
| Alice Williams | 29 | Boston | Engineer |`,
    },
});

Tables.test(
    "should be able to copy table contents to clipboard",
    async ({ canvas, userEvent, step }) => {
        let clipboardText = "";
        let clipboardWriteTextCalled = false;

        // Mock clipboard API - make write fail to test fallback to writeText
        const originalWrite = navigator.clipboard.write.bind(
            navigator.clipboard,
        );
        const originalWriteText = navigator.clipboard.writeText.bind(
            navigator.clipboard,
        );

        // Make write throw to trigger fallback to writeText
        navigator.clipboard.write = async () => {
            throw new Error("Clipboard write failed");
        };

        navigator.clipboard.writeText = async (text: string) => {
            clipboardWriteTextCalled = true;
            clipboardText = text;
            return originalWriteText(text);
        };

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
                            expect(clipboardWriteTextCalled).toBe(true);
                        },
                        { timeout: 3000 },
                    );

                    // Get the actual table element to extract expected textContent
                    const table = canvas.getByRole("table");
                    expect(table).toBeInTheDocument();

                    // The clipboard should contain the table's textContent
                    // which is all text nodes concatenated (without markdown formatting)
                    const expectedText = table.textContent || "";
                    expect(clipboardText).toBe(expectedText);
                },
            );
        } finally {
            // Cleanup
            navigator.clipboard.write = originalWrite;
            navigator.clipboard.writeText = originalWriteText;
        }
    },
);

Tables.test(
    "should be able to download table as CSV",
    async ({ canvas, userEvent, step }) => {
        let downloadLinkCreated = false;
        let downloadLinkClicked = false;

        // Track if download link is created
        const originalCreateElement = document.createElement.bind(document);
        document.createElement = function (
            tagName: string,
            options?: ElementCreationOptions,
        ) {
            const element = originalCreateElement(tagName, options);
            if (tagName === "a") {
                downloadLinkCreated = true;
                // Mock click to prevent actual download
                element.click = function () {
                    downloadLinkClicked = true;
                    // Don't call original click to prevent actual download
                };
            }
            return element;
        };

        try {
            await step("Find and click the download button", async () => {
                const downloadButton = canvas.getByRole("button", {
                    name: "Download Table",
                });
                expect(downloadButton).toBeInTheDocument();
                await userEvent.click(downloadButton);
            });

            await step("Wait for dropdown menu to open", async () => {
                const menu = await waitFor(() =>
                    document.querySelector(
                        '[data-slot="dropdown-menu-content"]',
                    ),
                );
                expect(menu).toBeInTheDocument();
            });

            await step("Find and click the CSV download option", async () => {
                const downloadAsCSVButton = await waitFor(() => {
                    const items = Array.from(
                        document.querySelectorAll(
                            '[data-slot="dropdown-menu-item"]',
                        ) || [],
                    );

                    const item = items.find(item =>
                        item.textContent?.includes("Download as CSV"),
                    );

                    if (!item) {
                        throw new Error("Download as CSV button not found");
                    }

                    return item;
                });

                expect(downloadAsCSVButton).toBeInTheDocument();
                await userEvent.click(downloadAsCSVButton);
            });

            await step("Verify download was triggered", async () => {
                await waitFor(
                    () => {
                        expect(downloadLinkCreated).toBe(true);
                        expect(downloadLinkClicked).toBe(true);
                    },
                    { timeout: 3000 },
                );
            });
        } finally {
            // Cleanup
            document.createElement = originalCreateElement;
        }
    },
);

Tables.test(
    "should be able to download table as Excel",
    async ({ canvas, userEvent, step }) => {
        let downloadLinkCreated = false;
        let downloadLinkClicked = false;

        // Track if download link is created
        const originalCreateElement = document.createElement.bind(document);
        document.createElement = function (
            tagName: string,
            options?: ElementCreationOptions,
        ) {
            const element = originalCreateElement(tagName, options);
            if (tagName === "a") {
                downloadLinkCreated = true;
                // Mock click to prevent actual download
                element.click = function () {
                    downloadLinkClicked = true;
                    // Don't call original click to prevent actual download
                };
            }
            return element;
        };

        try {
            await step("Find and click the download button", async () => {
                const downloadButton = canvas.getByRole("button", {
                    name: "Download Table",
                });
                expect(downloadButton).toBeInTheDocument();
                await userEvent.click(downloadButton);
            });

            await step("Wait for dropdown menu to open", async () => {
                const menu = await waitFor(() =>
                    document.querySelector(
                        '[data-slot="dropdown-menu-content"]',
                    ),
                );
                expect(menu).toBeInTheDocument();
            });

            await step("Find and click the Excel download option", async () => {
                const downloadAsExcelButton = await waitFor(() => {
                    const items = Array.from(
                        document.querySelectorAll(
                            '[data-slot="dropdown-menu-item"]',
                        ) || [],
                    );

                    const item = items.find(item =>
                        item.textContent?.includes("Download as Excel"),
                    );

                    if (!item) {
                        throw new Error("Download as Excel button not found");
                    }

                    return item;
                });

                expect(downloadAsExcelButton).toBeInTheDocument();
                await userEvent.click(downloadAsExcelButton);
            });

            await step("Verify download was triggered", async () => {
                await waitFor(
                    () => {
                        expect(downloadLinkCreated).toBe(true);
                        expect(downloadLinkClicked).toBe(true);
                    },
                    { timeout: 3000 },
                );
            });
        } finally {
            // Cleanup
            document.createElement = originalCreateElement;
        }
    },
);

export const Links = meta.story({
    render: () => (
        <div className="space-y-4">
            <Markdown content="Visit [GitHub](https://github.com) for open source projects." />
            <Markdown content="Check out [React documentation](https://react.dev) to learn more." />
            <Markdown content="Here's a link with [custom text](https://example.com) that opens in a new tab." />
        </div>
    ),
});

export const Blockquotes = meta.story({
    args: {
        content: `> This is a blockquote.
> It can span multiple lines.
> 
> And can include **formatting** like *italic* text.

> You can also nest blockquotes:
> > This is a nested blockquote.
> > It's indented further.`,
    },
});

export const HorizontalRule = meta.story({
    args: {
        content: `Content above the line

---

Content below the line`,
    },
});

export const MixedContent = meta.story({
    args: {
        content: `# Getting Started

This guide will help you get started with our project.

## Installation

To install the package, run:

\`\`\`bash
npm install package-name
\`\`\`

## Features

- **Feature 1**: Description of feature 1
- **Feature 2**: Description of feature 2
- **Feature 3**: Description of feature 3

## Usage

Here's a simple example:

\`\`\`typescript
import { Component } from 'package-name';

function App() {
    return <Component />;
}
\`\`\`

## Data Table

| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Value 1  | Value 2  | Value 3  |
| Value 4  | Value 5  | Value 6  |

> **Note**: This is an important note about the usage.

For more information, visit our [documentation](https://example.com/docs).`,
    },
});

export const WithImages = meta.story({
    args: {
        content: `# Image Example

Here's an image:

![Sample Image](https://picsum.photos/seed/markdown1/800/400)

You can also add images with links:

[![Linked Image](https://picsum.photos/seed/markdown2/600/300)](https://example.com)

Here's another example with a different image:

![Nature](https://picsum.photos/seed/markdown3/800/400)`,
    },
});

export const ImagesDisabled = meta.story({
    args: {
        content: `# Image Example (Disabled)

This markdown contains an image, but image rendering is disabled:

![Sample Image](https://picsum.photos/seed/markdown-disabled/800/400)

The image should not be displayed.`,
        disableImageRendering: true,
    },
});

export const ComplexExample = meta.story({
    args: {
        content: `# Complete Markdown Guide

This document demonstrates all the features of the Markdown component.

## Text Formatting

You can use **bold**, *italic*, ***bold and italic***, \`code\`, and ~~strikethrough~~.

## Lists

### Unordered List
- Item 1
- Item 2
  - Nested item 2.1
  - Nested item 2.2
- Item 3

### Ordered List
1. First step
2. Second step
   1. Sub-step 2.1
   2. Sub-step 2.2
3. Third step

## Code Examples

### Inline Code
Use \`console.log()\` for debugging.

### Code Block
\`\`\`javascript
// Example function
function calculateSum(a, b) {
    return a + b;
}

const result = calculateSum(5, 3);
console.log(result); // Output: 8
\`\`\`

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Code Blocks | ✅ | With syntax highlighting |
| Tables | ✅ | With copy/download |
| Links | ✅ | External links open in new tab |
| Images | ✅ | Can be disabled |

## Blockquotes

> "The best way to predict the future is to invent it."
> — Alan Kay

## Links

- [GitHub](https://github.com)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/)

---

**End of document**`,
    },
});
