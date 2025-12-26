import preview from "#.storybook/preview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HttpResponse, http } from "msw";
import { useEffect } from "react";
import { expect, mocked, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
import type {
    DBUserChatPreferences,
    DBUserId,
    UIUser,
} from "@/features/user/lib/types";
import { UserCacheSyncProvider } from "@/features/user/providers";
import { upsertUserChatPreferences } from "@/features/user/services/actions/upsert-user-chat-preferences";

import { api } from "@/lib/api-response";

import {
    UserChatPreferenceDialog,
    UserChatPreferenceDialogTrigger,
} from "./user-chat-preference-dialog";

const mockUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;

const mockUser: UIUser = {
    id: mockUserId,
    name: "John Doe",
    email: "john.doe@example.com",
    role: USER_ROLE.USER,
    image: null,
};

const mockUserChatPreferences: DBUserChatPreferences = {
    id: "00000000-0000-0000-0000-000000000010",
    userId: mockUserId,
    nickname: "Johnny",
    role: "Software Engineer",
    personality: "FRIENDLY",
    characteristics: "Quick Wit, Direct",
    extraInfo: "I love coding and playing guitar",
    createdAt: new Date().toISOString(),
};

const emptyPreferences: DBUserChatPreferences = {
    id: "00000000-0000-0000-0000-000000000011",
    userId: mockUserId,
    nickname: null,
    role: null,
    personality: "FRIENDLY",
    characteristics: null,
    extraInfo: null,
    createdAt: new Date().toISOString(),
};

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
                staleTime: 0,
            },
        },
    });
}

const StoryWrapper = ({
    Story,
    storyKey,
}: {
    Story: React.ComponentType<any>;
    storyKey?: string;
}) => {
    const queryClient = createQueryClient();

    useEffect(() => {
        queryClient.clear();
    }, [queryClient, storyKey]);

    return (
        <QueryClientProvider client={queryClient} key={storyKey}>
            <UserCacheSyncProvider>
                <Story />
                <Toaster />
            </UserCacheSyncProvider>
        </QueryClientProvider>
    );
};

const meta = preview.meta({
    component: UserChatPreferenceDialog,
    decorators: [
        (Story, context) => (
            <StoryWrapper Story={Story} storyKey={context.name || context.id} />
        ),
    ],
    argTypes: {
        user: {
            description: "The user object",
            table: {
                type: {
                    summary: "UIUser",
                },
            },
        },
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
});

export const Default = meta.story({
    render: args => (
        <UserChatPreferenceDialog {...args} user={mockUser}>
            <UserChatPreferenceDialogTrigger asChild>
                <Button>Open Chat Preferences</Button>
            </UserChatPreferenceDialogTrigger>
        </UserChatPreferenceDialog>
    ),
    parameters: {
        msw: {
            handlers: [
                http.get("/api/user/chat-preferences", () => {
                    return HttpResponse.json(
                        api.success.user.getChatPreferences(emptyPreferences),
                    );
                }),
            ],
        },
    },
    beforeEach: () => {
        const queryClient = createQueryClient();
        queryClient.clear();
        mocked(upsertUserChatPreferences).mockResolvedValue(
            api.success.user.updateChatPreferences(emptyPreferences),
        );
    },
    afterEach: () => {
        mocked(upsertUserChatPreferences).mockClear();
    },
    args: {
        user: mockUser,
        defaultOpen: false,
    },
});

Default.test(
    "should open dialog when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open chat preferences/i,
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
    "should render form inside dialog when opened",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open chat preferences/i,
        });
        await userEvent.click(trigger);

        await waitFor(() => {
            const dialog = document.querySelector('[role="dialog"]');
            expect(dialog).toBeInTheDocument();

            const form = document.querySelector("form");
            expect(form).toBeInTheDocument();
        });
    },
);

export const WithFilledData = meta.story({
    render: args => (
        <UserChatPreferenceDialog {...args} user={mockUser}>
            <UserChatPreferenceDialogTrigger asChild>
                <Button>Open Chat Preferences</Button>
            </UserChatPreferenceDialogTrigger>
        </UserChatPreferenceDialog>
    ),
    parameters: {
        msw: {
            handlers: [
                http.get("/api/user/chat-preferences", () => {
                    return HttpResponse.json(
                        api.success.user.getChatPreferences(
                            mockUserChatPreferences,
                        ),
                    );
                }),
            ],
        },
    },
    beforeEach: () => {
        const queryClient = createQueryClient();
        queryClient.clear();
        mocked(upsertUserChatPreferences).mockResolvedValue(
            api.success.user.updateChatPreferences(mockUserChatPreferences),
        );
    },
    afterEach: () => {
        mocked(upsertUserChatPreferences).mockClear();
    },
    args: {
        user: mockUser,
        defaultOpen: false,
    },
});

WithFilledData.test(
    "should open dialog when trigger is clicked",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open chat preferences/i,
        });
        await userEvent.click(trigger);

        await waitFor(() => {
            const dialog = document.querySelector('[role="dialog"]');
            expect(dialog).toBeInTheDocument();
        });
    },
);
