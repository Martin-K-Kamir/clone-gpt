import preview from "#.storybook/preview";
import { QueryProvider } from "@/providers/query-provider";
import { expect, mocked, waitFor } from "storybook/test";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

import { SessionSyncProvider } from "@/features/auth/providers";

import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
} from "@/features/chat/providers";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
import type { DBUserId, UIUser } from "@/features/user/lib/types";
import {
    UserCacheSyncProvider,
    UserSessionProvider,
} from "@/features/user/providers";
import { updateUserName } from "@/features/user/services/actions/update-user-name";

import { api } from "@/lib/api-response";

import {
    UserProfileDialog,
    UserProfileDialogTrigger,
} from "./user-profile-dialog";

const mockUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;

const mockUser: UIUser = {
    id: mockUserId,
    name: "John Doe",
    email: "john.doe@example.com",
    role: USER_ROLE.USER,
    image: null,
};

const meta = preview.meta({
    component: UserProfileDialog,
    decorators: [
        Story => (
            <QueryProvider>
                <UserSessionProvider>
                    <SessionSyncProvider>
                        <ChatOffsetProvider>
                            <ChatCacheSyncProvider>
                                <UserCacheSyncProvider>
                                    <Story />
                                    <Toaster />
                                </UserCacheSyncProvider>
                            </ChatCacheSyncProvider>
                        </ChatOffsetProvider>
                    </SessionSyncProvider>
                </UserSessionProvider>
            </QueryProvider>
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
        <UserProfileDialog {...args} user={mockUser}>
            <UserProfileDialogTrigger asChild>
                <Button>Open Profile Settings</Button>
            </UserProfileDialogTrigger>
        </UserProfileDialog>
    ),
    beforeEach: () => {
        mocked(updateUserName).mockResolvedValue(
            api.success.user.updateName("John Doe"),
        );
    },
    afterEach: () => {
        mocked(updateUserName).mockClear();
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
            name: /open profile settings/i,
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
    "should render form inside dialog",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open profile settings/i,
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

Default.test(
    "should render delete profile dialog inside dialog",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open profile settings/i,
        });
        await userEvent.click(trigger);

        await waitFor(() => {
            const dialog = document.querySelector('[role="dialog"]');
            expect(dialog).toBeInTheDocument();
        });

        const buttons = document.querySelectorAll("button");

        const deleteProfileButton = Array.from(buttons).find(
            button => button.textContent === "Delete Profile",
        );
        await userEvent.click(deleteProfileButton!);

        await waitFor(() => {
            const dialog = document.querySelector('[role="alertdialog"]');
            expect(dialog).toBeInTheDocument();
        });
    },
);

Default.test(
    "should render delete all chats dialog inside dialog",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: /open profile settings/i,
        });
        await userEvent.click(trigger);

        await waitFor(() => {
            const dialog = document.querySelector('[role="dialog"]');
            expect(dialog).toBeInTheDocument();
        });

        const buttons = document.querySelectorAll("button");

        const deleteAllChatsButton = Array.from(buttons).find(
            button => button.textContent === "Delete All Chats",
        );
        await userEvent.click(deleteAllChatsButton!);

        await waitFor(() => {
            const dialog = document.querySelector('[role="alertdialog"]');
            expect(dialog).toBeInTheDocument();
        });
    },
);
