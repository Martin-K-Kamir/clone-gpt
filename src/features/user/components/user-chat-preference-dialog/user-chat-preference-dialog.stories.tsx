import { AppProviders } from "#.storybook/lib/decorators/providers";
import { MOCK_USER_BUTTON_OPEN_CHAT_PREFERENCES } from "#.storybook/lib/mocks/user-components";
import {
    MOCK_EMPTY_USER_CHAT_PREFERENCES,
    MOCK_USER_CHAT_PREFERENCES,
    createMockUser,
} from "#.storybook/lib/mocks/users";
import { createUserChatPreferencesHandler } from "#.storybook/lib/msw/handlers";
import { clearAllQueries } from "#.storybook/lib/utils/query-client";
import {
    waitForDialog,
    waitForElement,
} from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect, mocked } from "storybook/test";

import { Button } from "@/components/ui/button";

import { upsertUserChatPreferences } from "@/features/user/services/actions/upsert-user-chat-preferences";

import { api } from "@/lib/api-response";

import {
    UserChatPreferenceDialog,
    UserChatPreferenceDialogTrigger,
} from "./user-chat-preference-dialog";

const mockUser = createMockUser();

const meta = preview.meta({
    component: UserChatPreferenceDialog,
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <Story />
            </AppProviders>
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
                <Button>{MOCK_USER_BUTTON_OPEN_CHAT_PREFERENCES}</Button>
            </UserChatPreferenceDialogTrigger>
        </UserChatPreferenceDialog>
    ),
    parameters: {
        msw: {
            handlers: [
                createUserChatPreferencesHandler({
                    preferences: MOCK_EMPTY_USER_CHAT_PREFERENCES,
                }),
            ],
        },
    },
    beforeEach: () => {
        clearAllQueries();
        mocked(upsertUserChatPreferences).mockResolvedValue(
            api.success.user.updateChatPreferences(
                MOCK_EMPTY_USER_CHAT_PREFERENCES,
            ),
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
            name: new RegExp(MOCK_USER_BUTTON_OPEN_CHAT_PREFERENCES, "i"),
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);

        await waitForDialog("dialog");
    },
);

Default.test(
    "should render form inside dialog when opened",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_USER_BUTTON_OPEN_CHAT_PREFERENCES, "i"),
        });
        await userEvent.click(trigger);

        await waitForDialog("dialog");

        const form = await waitForElement("form");
        expect(form).toBeInTheDocument();
    },
);

export const WithFilledData = meta.story({
    render: args => (
        <UserChatPreferenceDialog {...args} user={mockUser}>
            <UserChatPreferenceDialogTrigger asChild>
                <Button>{MOCK_USER_BUTTON_OPEN_CHAT_PREFERENCES}</Button>
            </UserChatPreferenceDialogTrigger>
        </UserChatPreferenceDialog>
    ),
    parameters: {
        msw: {
            handlers: [
                createUserChatPreferencesHandler({
                    preferences: MOCK_USER_CHAT_PREFERENCES,
                }),
            ],
        },
    },
    beforeEach: () => {
        clearAllQueries();
        mocked(upsertUserChatPreferences).mockResolvedValue(
            api.success.user.updateChatPreferences(MOCK_USER_CHAT_PREFERENCES),
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
            name: new RegExp(MOCK_USER_BUTTON_OPEN_CHAT_PREFERENCES, "i"),
        });
        await userEvent.click(trigger);

        await waitForDialog("dialog");
    },
);
