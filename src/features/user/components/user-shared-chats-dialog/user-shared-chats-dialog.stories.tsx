import { AppProviders } from "#.storybook/lib/decorators/providers";
import { createMockChats } from "#.storybook/lib/mocks/chats";
import { MOCK_USER_BUTTON_OPEN_SHARED_CHATS } from "#.storybook/lib/mocks/user-components";
import {
    createEmptySharedChatsHandler,
    createSharedChatsHandler,
} from "#.storybook/lib/msw/handlers";
import { clearUserSharedChatsQueries } from "#.storybook/lib/utils/query-client";
import {
    waitForDialog,
    waitForElement,
} from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect, mocked } from "storybook/test";

import { Button } from "@/components/ui/button";

import { CHAT_VISIBILITY } from "@/features/chat/lib/constants";
import type { DBChatId } from "@/features/chat/lib/types";
import {
    setAllUserChatsVisibility,
    updateManyChatsVisibility,
} from "@/features/chat/services/actions";

import { api } from "@/lib/api-response";
import { PLURAL } from "@/lib/constants";

import {
    UserSharedChatsDialog,
    UserSharedChatsDialogTrigger,
} from "./user-shared-chats-dialog";

const mockChats = createMockChats({
    length: 50,
    visibility: CHAT_VISIBILITY.PUBLIC,
});

const meta = preview.meta({
    component: UserSharedChatsDialog,
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <Story />
            </AppProviders>
        ),
    ],
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
                <Button>{MOCK_USER_BUTTON_OPEN_SHARED_CHATS}</Button>
            </UserSharedChatsDialogTrigger>
        </UserSharedChatsDialog>
    ),
    parameters: {
        msw: {
            handlers: [createSharedChatsHandler({ chats: mockChats })],
        },
    },
    beforeEach: () => {
        clearUserSharedChatsQueries();

        mocked(updateManyChatsVisibility).mockImplementation(
            async ({ chatIds }: { chatIds: DBChatId[] }) => {
                const deletedChats = chatIds.map(id => {
                    const index = parseInt(id.replace("chat-", ""), 10);
                    return mockChats[index]!;
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
            name: new RegExp(MOCK_USER_BUTTON_OPEN_SHARED_CHATS, "i"),
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);

        await waitForDialog("dialog");
    },
);

Default.test(
    "should render table inside dialog when opened",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_USER_BUTTON_OPEN_SHARED_CHATS, "i"),
        });
        await userEvent.click(trigger);

        await waitForDialog("dialog");

        await waitForElement("table");
    },
);

export const Empty = meta.story({
    render: args => (
        <UserSharedChatsDialog {...args}>
            <UserSharedChatsDialogTrigger asChild>
                <Button>{MOCK_USER_BUTTON_OPEN_SHARED_CHATS}</Button>
            </UserSharedChatsDialogTrigger>
        </UserSharedChatsDialog>
    ),
    parameters: {
        msw: {
            handlers: [createEmptySharedChatsHandler()],
        },
    },
    beforeEach: () => {
        clearUserSharedChatsQueries();

        mocked(updateManyChatsVisibility).mockResolvedValue(
            api.success.chat.visibility([], {
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
            name: new RegExp(MOCK_USER_BUTTON_OPEN_SHARED_CHATS, "i"),
        });
        await userEvent.click(trigger);

        await waitForElement("[data-testid='data-table-content-no-results']");
    },
);
