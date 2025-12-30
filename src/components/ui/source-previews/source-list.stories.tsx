import { QueryProvider } from "#.storybook/lib/decorators/providers";
import {
    MOCK_SOURCE_PARTS,
    MOCK_SOURCE_PREVIEWS,
} from "#.storybook/lib/mocks/messages";
import {
    MOCK_SOURCE_URL_GITHUB,
    MOCK_SOURCE_URL_REACT,
    MOCK_SOURCE_URL_TAILWIND,
} from "#.storybook/lib/mocks/source-previews";
import {
    createEmptyResourcePreviewsHandler,
    createErrorResourcePreviewsHandler,
    createLoadingResourcePreviewsHandler,
    createResourcePreviewsHandler,
} from "#.storybook/lib/msw/handlers";
import { clickLinkAndVerify } from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { type SourceUrlUIPart } from "ai";
import { expect, waitFor } from "storybook/test";

import { SourceList } from "./source-list";

const mockSources: SourceUrlUIPart[] = MOCK_SOURCE_PARTS.filter(
    part => part.type === "source-url",
);

const meta = preview.meta({
    component: SourceList,
    decorators: [
        Story => (
            <QueryProvider>
                <Story />
            </QueryProvider>
        ),
    ],
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        sources: {
            control: "object",
            description: "Array of source URL parts from AI SDK",
            table: {
                type: {
                    summary: "SourceUrlUIPart[]",
                },
            },
        },
        classNameItem: {
            control: "text",
            description: "Additional CSS class for list items",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        classNameSkeleton: {
            control: "text",
            description: "Additional CSS class for skeleton state",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        classNameItemSkeleton: {
            control: "text",
            description: "Additional CSS class for individual skeleton items",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        classNameLinks: {
            control: "text",
            description: "Additional CSS class for fallback links container",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        classNameLink: {
            control: "text",
            description: "Additional CSS class for individual fallback links",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        className: {
            control: "text",
            description: "Additional CSS class for the list container",
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
        sources: mockSources,
    },
    parameters: {
        msw: {
            handlers: [createResourcePreviewsHandler()],
        },
    },
});

Default.test("should render source items after loading", async ({ canvas }) => {
    await waitFor(
        () => {
            const links = canvas.getAllByRole("link");
            expect(links).toHaveLength(3);
        },
        { timeout: 5000 },
    );
});

Default.test(
    "should have interactive links that navigate to correct destinations",
    async ({ canvas, userEvent }) => {
        await waitFor(
            () => {
                const links = canvas.getAllByRole("link");
                expect(links).toHaveLength(3);
            },
            { timeout: 5000 },
        );

        const links = canvas.getAllByRole("link");

        expect(links[0]).toHaveAttribute("href", MOCK_SOURCE_URL_GITHUB);
        expect(links[1]).toHaveAttribute("href", MOCK_SOURCE_URL_REACT);
        expect(links[2]).toHaveAttribute("href", MOCK_SOURCE_URL_TAILWIND);

        links.forEach(link => {
            expect(link).toHaveAttribute("target", "_blank");
            expect(link).toHaveAttribute("rel", "noopener noreferrer");
        });

        for (const link of links) {
            await clickLinkAndVerify(link, userEvent);
            expect(link).toBeVisible();
        }
    },
);

export const Loading = meta.story({
    name: "Loading State",
    args: {
        sources: mockSources,
    },
    parameters: {
        msw: {
            handlers: [createLoadingResourcePreviewsHandler()],
        },
    },
});

Loading.test("should show skeleton while loading", async ({ canvas }) => {
    const list = canvas.getByRole("list");
    expect(list).toBeVisible();

    expect(canvas.getAllByTestId("skeleton").length).toBeGreaterThan(0);
    expect(canvas.getAllByRole("listitem").length).toBeGreaterThan(0);
});

export const Error = meta.story({
    name: "Error State",
    args: {
        sources: mockSources,
    },
    parameters: {
        a11y: {
            disable: true,
        },
        msw: {
            handlers: [createErrorResourcePreviewsHandler()],
        },
    },
});

Error.test("should show fallback links on error", async ({ canvas }) => {
    await waitFor(
        () => {
            const links = canvas.getAllByRole("link");
            expect(links).toHaveLength(3);
            expect(canvas.getByText(MOCK_SOURCE_URL_GITHUB)).toBeVisible();
            expect(canvas.getByText(MOCK_SOURCE_URL_REACT)).toBeVisible();
            expect(canvas.getByText(MOCK_SOURCE_URL_TAILWIND)).toBeVisible();
        },
        { timeout: 5000 },
    );
});

Error.test(
    "should be interactive links that navigate to correct destinations",
    async ({ canvas, userEvent }) => {
        await waitFor(
            () => {
                const links = canvas.getAllByRole("link");
                expect(links).toHaveLength(3);
            },
            { timeout: 5000 },
        );

        const links = canvas.getAllByRole("link");

        expect(links[0]).toHaveAttribute("href", MOCK_SOURCE_URL_GITHUB);
        expect(links[1]).toHaveAttribute("href", MOCK_SOURCE_URL_REACT);
        expect(links[2]).toHaveAttribute("href", MOCK_SOURCE_URL_TAILWIND);

        links.forEach(link => {
            expect(link).toHaveAttribute("target", "_blank");
            expect(link).toHaveAttribute("rel", "noopener noreferrer");
        });

        for (const link of links) {
            await clickLinkAndVerify(link, userEvent);
            expect(link).toBeVisible();
        }
    },
);

export const Empty = meta.story({
    args: {
        sources: [],
    },
    parameters: {
        msw: {
            handlers: [createEmptyResourcePreviewsHandler()],
        },
    },
});

Empty.test("should show empty state", async ({ canvas }) => {
    expect(canvas.queryAllByRole("link")).toHaveLength(0);
});

export const DuplicateUrls = meta.story({
    args: {
        sources: [
            mockSources[0],
            mockSources[0], // duplicate
            mockSources[1],
        ],
    },
    parameters: {
        msw: {
            handlers: [
                createResourcePreviewsHandler({
                    previews: [
                        MOCK_SOURCE_PREVIEWS[0],
                        MOCK_SOURCE_PREVIEWS[1],
                    ],
                }),
            ],
        },
    },
});

DuplicateUrls.test("should deduplicate URLs", async ({ canvas }) => {
    await waitFor(
        () => {
            const links = canvas.getAllByRole("link");
            expect(links).toHaveLength(2);
        },
        { timeout: 5000 },
    );
});
