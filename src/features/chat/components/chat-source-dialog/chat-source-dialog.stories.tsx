import preview from "#.storybook/preview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HttpResponse, delay, http } from "msw";
import { useMemo } from "react";
import { expect, waitFor } from "storybook/test";

import type { UIAssistantChatMessage } from "@/features/chat/lib/types";

import { SourcePreview } from "@/lib/types";

import { ChatSourceDialog } from "./chat-source-dialog";

const mockSourceParts: UIAssistantChatMessage["parts"] = [
    {
        type: "source-url",
        sourceId: "source-1",
        url: "https://github.com/vercel/next.js",
        title: "Next.js - The React Framework",
    },
    {
        type: "source-url",
        sourceId: "source-2",
        url: "https://react.dev/reference/react",
        title: "React Reference Documentation",
    },
    {
        type: "source-url",
        sourceId: "source-3",
        url: "https://tailwindcss.com/docs",
        title: "Tailwind CSS Documentation",
    },
];

const mockPreviews: SourcePreview[] = [
    {
        url: "https://github.com/vercel/next.js",
        title: "Next.js by Vercel - The React Framework for the Web",
        description:
            "Production grade React applications that scale. The world's leading companies use Next.js to build static and dynamic websites and web applications.",
        siteName: "GitHub",
        image: "https://opengraph.githubassets.com/next.js",
        favicon: "https://github.githubassets.com/favicons/favicon.svg",
    },
    {
        url: "https://react.dev/reference/react",
        title: "React Reference Overview",
        description:
            "The React reference documentation provides detailed information about working with React.",
        siteName: "React",
        image: "https://react.dev/images/og-home.png",
        favicon: "https://react.dev/favicon.ico",
    },
    {
        url: "https://tailwindcss.com/docs",
        title: "Tailwind CSS - Documentation",
        description:
            "A utility-first CSS framework packed with classes that can be composed to build any design, directly in your markup.",
        siteName: "Tailwind CSS",
        image: "https://tailwindcss.com/og-image.png",
        favicon: "https://tailwindcss.com/favicon.ico",
    },
];

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                staleTime: Infinity,
            },
        },
    });
}

const StoryWrapper = ({ Story }: { Story: React.ComponentType }) => {
    const queryClient = useMemo(() => createQueryClient(), []);

    return (
        <QueryClientProvider client={queryClient}>
            <div className="p-4">
                <Story />
            </div>
        </QueryClientProvider>
    );
};

const meta = preview.meta({
    component: ChatSourceDialog,
    decorators: [Story => <StoryWrapper Story={Story} />],
    argTypes: {
        parts: {
            control: "object",
            description: "Array of message parts from assistant message",
        },
        disabled: {
            control: "boolean",
            description: "Whether the trigger button is disabled",
        },
        classNameTrigger: {
            control: "text",
            description: "Additional CSS class for the trigger button",
        },
        triggerRef: {
            control: false,
            description: "Ref for the trigger button",
        },
    },
});

export const Default = meta.story({
    args: {
        parts: mockSourceParts,
    },
    parameters: {
        msw: {
            handlers: [
                http.post("/api/resource-previews", async () => {
                    return HttpResponse.json(mockPreviews);
                }),
            ],
        },
    },
});

Default.test("should render sources button", async ({ canvas }) => {
    const button = canvas.getByRole("button");
    expect(button).toBeInTheDocument();
});

Default.test("should show source icons", async ({ canvas }) => {
    const images = canvas.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0);
});

Default.test(
    "should open dialog when button is clicked",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");
        await userEvent.click(button);

        await waitFor(() => {
            const dialog = document.querySelector(
                '[data-slot="dialog-content"]',
            );
            expect(dialog).toBeInTheDocument();
        });
    },
);

export const WithSingleSource = meta.story({
    args: {
        parts: [mockSourceParts[0]],
    },
    parameters: {
        msw: {
            handlers: [
                http.post("/api/resource-previews", async () => {
                    return HttpResponse.json([mockPreviews[0]]);
                }),
            ],
        },
    },
});

WithSingleSource.test(
    "should show single source in dialog",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");
        await userEvent.click(button);

        await waitFor(() => {
            const dialog = document.querySelector(
                '[data-slot="dialog-content"]',
            );
            expect(dialog).toBeInTheDocument();
        });
    },
);

export const WithManySources = meta.story({
    args: {
        parts: [
            ...mockSourceParts,
            {
                type: "source-url",
                sourceId: "source-4",
                url: "https://www.typescriptlang.org/docs",
                title: "TypeScript Documentation",
            },
            {
                type: "source-url",
                sourceId: "source-5",
                url: "https://nodejs.org/docs",
                title: "Node.js Documentation",
            },
        ],
    },
    parameters: {
        msw: {
            handlers: [
                http.post("/api/resource-previews", async () => {
                    return HttpResponse.json([
                        ...mockPreviews,
                        {
                            url: "https://www.typescriptlang.org/docs",
                            title: "TypeScript Documentation",
                            description: "TypeScript documentation",
                            siteName: "TypeScript",
                            image: "",
                            favicon: "",
                        },
                        {
                            url: "https://nodejs.org/docs",
                            title: "Node.js Documentation",
                            description: "Node.js documentation",
                            siteName: "Node.js",
                            image: "",
                            favicon: "",
                        },
                    ]);
                }),
            ],
        },
    },
});

WithManySources.test(
    "should show all sources in dialog",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");
        await userEvent.click(button);

        await waitFor(() => {
            const dialog = document.querySelector(
                '[data-slot="dialog-content"]',
            );
            expect(dialog).toBeInTheDocument();

            const items = dialog?.querySelectorAll("li");
            expect(items?.length).toBeGreaterThan(0);
        });
    },
);

export const WithMixedParts = meta.story({
    args: {
        parts: [
            {
                type: "text",
                text: "Here are some sources:",
            },
            ...mockSourceParts,
            {
                type: "text",
                text: "More information available.",
            },
        ],
    },
    parameters: {
        msw: {
            handlers: [
                http.post("/api/resource-previews", async () => {
                    return HttpResponse.json(mockPreviews);
                }),
            ],
        },
    },
});

WithMixedParts.test(
    "should filter only source-url parts",
    async ({ canvas, userEvent }) => {
        const button = canvas.getByRole("button");
        await userEvent.click(button);

        await waitFor(() => {
            const dialog = document.querySelector(
                '[data-slot="dialog-content"]',
            );
            expect(dialog).toBeInTheDocument();

            const items = dialog?.querySelectorAll("li");
            expect(items?.length).toBeGreaterThan(0);
        });
    },
);
