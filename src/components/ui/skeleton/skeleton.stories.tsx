import preview from "#.storybook/preview";

import { Skeleton } from "./skeleton";

const meta = preview.meta({
    component: Skeleton,
    parameters: {
        a11y: {
            test: "error",
        },
    },
    argTypes: {
        className: {
            control: "text",
            description: "Additional CSS classes to customize the skeleton",
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
        className: "h-4 w-48",
    },
});

export const Avatar = meta.story({
    args: {
        className: "h-12 w-12 rounded-full aspect-square",
    },
});

export const TextBlock = meta.story({
    render: () => (
        <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
        </div>
    ),
});

export const ChatMessage = meta.story({
    render: () => (
        <div className="flex gap-3">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-2/3" />
            </div>
        </div>
    ),
});
