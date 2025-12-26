import preview from "#.storybook/preview";
import { QueryProvider, getQueryClient } from "@/providers/query-provider";
import { HttpResponse, http } from "msw";
import { expect, mocked, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

import {
    CHAT_VISIBILITY,
    QUERY_USER_SHARED_CHATS_DESKTOP_LIMIT,
} from "@/features/chat/lib/constants";
import type { DBChat, DBChatId } from "@/features/chat/lib/types";
import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
} from "@/features/chat/providers";
import {
    setAllUserChatsVisibility,
    updateManyChatsVisibility,
} from "@/features/chat/services/actions";

import type { DBUserId } from "@/features/user/lib/types";

import { api } from "@/lib/api-response";
import { tag } from "@/lib/cache-tag";
import { PLURAL } from "@/lib/constants";
import type { PaginatedData } from "@/lib/types";

import {
    UserSharedChatsDialog,
    UserSharedChatsDialogTrigger,
} from "./user-shared-chats-dialog";

const mockUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;

const adjectives = [
    "Modern",
    "Advanced",
    "Complete",
    "Simple",
    "Quick",
    "Deep",
    "Practical",
    "Comprehensive",
    "Essential",
    "Ultimate",
    "Beginner",
    "Professional",
    "Effective",
    "Creative",
    "Powerful",
];

const verbs = [
    "Learn",
    "Build",
    "Create",
    "Master",
    "Understand",
    "Implement",
    "Design",
    "Develop",
    "Explore",
    "Optimize",
    "Deploy",
    "Test",
    "Refactor",
    "Debug",
    "Scale",
];

const nouns = [
    "React",
    "TypeScript",
    "Next.js",
    "Node.js",
    "API",
    "Database",
    "Authentication",
    "State Management",
    "Component",
    "Hook",
    "Server Actions",
    "Middleware",
    "Routing",
    "Styling",
    "Testing",
    "Performance",
    "Security",
    "Deployment",
    "CI/CD",
    "Docker",
];

function generateChatTitle(index: number): string {
    const pattern = index % 4;
    const adjIndex = index % adjectives.length;
    const verbIndex = index % verbs.length;
    const nounIndex = index % nouns.length;

    switch (pattern) {
        case 0:
            return `${verbs[verbIndex]} ${nouns[nounIndex]}`;
        case 1:
            return `${verbs[verbIndex]} a ${adjectives[adjIndex]} ${nouns[nounIndex]}`;
        case 2:
            return `Understanding ${nouns[nounIndex]}`;
        case 3:
            return `How to ${verbs[verbIndex]} ${nouns[nounIndex]}`;
        default:
            return `${verbs[verbIndex]} ${nouns[nounIndex]}`;
    }
}

function createMockChat(index: number): DBChat {
    const fixedDate = new Date("2025-01-01");
    fixedDate.setDate(fixedDate.getDate() - index);
    const date = fixedDate.toISOString();

    return {
        id: `chat-${index}` as DBChatId,
        userId: mockUserId,
        title: generateChatTitle(index),
        visibility: CHAT_VISIBILITY.PUBLIC,
        createdAt: date,
        updatedAt: date,
        visibleAt: date,
    } as const;
}

function createMockChats(length: number): DBChat[] {
    return Array.from({ length }, (_, index) => createMockChat(index));
}

function createMockPaginatedData(
    length: number,
    hasNextPage = false,
): PaginatedData<DBChat[]> {
    return {
        data: createMockChats(length),
        totalCount: length,
        hasNextPage,
        nextOffset: hasNextPage ? length : undefined,
    };
}

const StoryWrapper = (Story: React.ComponentType<any>) => {
    return (
        <QueryProvider>
            <ChatOffsetProvider>
                <ChatCacheSyncProvider>
                    <Story />
                    <Toaster />
                </ChatCacheSyncProvider>
            </ChatOffsetProvider>
        </QueryProvider>
    );
};

const meta = preview.meta({
    component: UserSharedChatsDialog,
    decorators: [StoryWrapper],
    argTypes: {
        open: {
            control: "boolean",
            description: "Whether the dialog is open",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        defaultOpen: {
            control: "boolean",
            description: "Whether the dialog is open by default",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        dialogId: {
            control: "text",
            description: "Unique identifier for the dialog",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        onOpenChange: {
            description: "Callback fired when the open state changes",
            table: {
                type: {
                    summary: "(open: boolean) => void",
                },
            },
        },
    },
    parameters: {
        a11y: {
            config: {
                rules: [
                    { id: "color-contrast", enabled: false },
                    { id: "aria-valid-attr-value", enabled: false },
                ],
            },
        },
    },
});

export const Default = meta.story({
    render: args => (
        <UserSharedChatsDialog {...args}>
            <UserSharedChatsDialogTrigger asChild>
                <Button>Open Shared Chats</Button>
            </UserSharedChatsDialogTrigger>
        </UserSharedChatsDialog>
    ),
    parameters: {
        msw: {
            handlers: [
                http.get("/api/user-chats/shared", ({ request }) => {
                    const url = new URL(request.url);
                    const limitParam = url.searchParams.get("limit");
                    const offsetParam = url.searchParams.get("offset");
                    const limit = limitParam
                        ? parseInt(limitParam)
                        : QUERY_USER_SHARED_CHATS_DESKTOP_LIMIT;
                    const offset = offsetParam ? parseInt(offsetParam) : 0;

                    const totalChats = 50;
                    const chats = createMockChats(totalChats);
                    const paginatedChats = chats.slice(offset, offset + limit);
                    const hasNextPage = offset + limit < totalChats;

                    const response = api.success.chat.getShared(
                        {
                            data: paginatedChats,
                            hasNextPage,
                            totalCount: totalChats,
                            nextOffset: hasNextPage
                                ? offset + limit
                                : undefined,
                        },
                        { count: PLURAL.MULTIPLE },
                    );
                    return HttpResponse.json(response);
                }),
            ],
        },
    },
    beforeEach: () => {
        const queryClient = getQueryClient();
        queryClient.removeQueries({
            predicate: query => {
                const key = query.queryKey;
                return (
                    Array.isArray(key) &&
                    key.length > 0 &&
                    key[0] === tag.userSharedChats()
                );
            },
        });

        mocked(updateManyChatsVisibility).mockImplementation(
            async ({ chatIds }: { chatIds: DBChatId[] }) => {
                const deletedChats = chatIds.map(id => {
                    const index = parseInt(id.replace("chat-", ""));
                    return createMockChat(index);
                });
                return api.success.chat.visibility(deletedChats, {
                    visibility: CHAT_VISIBILITY.PRIVATE,
                    count: PLURAL.MULTIPLE,
                });
            },
        );
        mocked(setAllUserChatsVisibility).mockResolvedValue(
            api.success.chat.visibility(undefined, {
                visibility: CHAT_VISIBILITY.PRIVATE,
                count: PLURAL.MULTIPLE,
            }),
        );
    },
    afterEach: () => {
        mocked(updateManyChatsVisibility).mockClear();
        mocked(setAllUserChatsVisibility).mockClear();
    },
    args: {
        defaultOpen: false,
    },
});

Default.test(
    "should open dialog when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open shared chats/i,
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);

        const dialog = await waitFor(() =>
            document.querySelector('[role="dialog"]'),
        );
        expect(dialog).toBeInTheDocument();
    },
);

Default.test(
    "should render table inside dialog when opened",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open shared chats/i,
        });
        await userEvent.click(trigger);

        await waitFor(() => {
            const dialog = document.querySelector('[role="dialog"]');
            expect(dialog).toBeInTheDocument();

            const table = document.querySelector("table");
            expect(table).toBeInTheDocument();
        });
    },
);

export const Empty = meta.story({
    render: args => (
        <UserSharedChatsDialog {...args}>
            <UserSharedChatsDialogTrigger asChild>
                <Button>Open Shared Chats</Button>
            </UserSharedChatsDialogTrigger>
        </UserSharedChatsDialog>
    ),
    parameters: {
        msw: {
            handlers: [
                http.get("/api/user-chats/shared", () => {
                    const response = api.success.chat.getShared(
                        {
                            data: [],
                            hasNextPage: false,
                            totalCount: 0,
                        },
                        { count: PLURAL.MULTIPLE },
                    );
                    return HttpResponse.json(response);
                }),
            ],
        },
    },
    beforeEach: () => {
        const queryClient = getQueryClient();
        queryClient.removeQueries({
            predicate: query => {
                const key = query.queryKey;
                return (
                    Array.isArray(key) &&
                    key.length > 0 &&
                    key[0] === tag.userSharedChats()
                );
            },
        });

        mocked(updateManyChatsVisibility).mockResolvedValue(
            api.success.chat.visibility(createMockChats(0), {
                visibility: CHAT_VISIBILITY.PRIVATE,
                count: PLURAL.MULTIPLE,
            }),
        );
        mocked(setAllUserChatsVisibility).mockResolvedValue(
            api.success.chat.visibility(undefined, {
                visibility: CHAT_VISIBILITY.PRIVATE,
                count: PLURAL.MULTIPLE,
            }),
        );
    },
    afterEach: () => {
        mocked(updateManyChatsVisibility).mockClear();
        mocked(setAllUserChatsVisibility).mockClear();
    },
});

Empty.test(
    "should show empty state message when there are no shared chats",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open shared chats/i,
        });
        await userEvent.click(trigger);

        await waitFor(() => {
            const message = document.querySelector(
                "[data-testid='data-table-content-no-results']",
            );
            expect(message).toBeInTheDocument();
        });
    },
);
