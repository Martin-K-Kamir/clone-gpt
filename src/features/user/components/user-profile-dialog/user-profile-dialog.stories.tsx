import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    MOCK_USER_BUTTON_DELETE_ALL_CHATS,
    MOCK_USER_BUTTON_DELETE_PROFILE,
    MOCK_USER_BUTTON_OPEN_PROFILE_SETTINGS,
} from "#.storybook/lib/mocks/user-components";
import { createMockUser } from "#.storybook/lib/mocks/users";
import { getButtonByText } from "#.storybook/lib/utils/elements";
import {
    waitForDialog,
    waitForElement,
} from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect, fireEvent, mocked } from "storybook/test";

import { Button } from "@/components/ui/button";

import { updateUserName } from "@/features/user/services/actions/update-user-name";

import { api } from "@/lib/api-response";

import {
    UserProfileDialog,
    UserProfileDialogTrigger,
} from "./user-profile-dialog";

const mockUser = createMockUser();

const meta = preview.meta({
    component: UserProfileDialog,
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
    parameters: {
        a11y: {
            config: {
                rules: [
                    { id: "color-contrast", enabled: false },
                    { id: "aria-valid-attr-value", enabled: false },
                    { id: "aria-hidden-focus", enabled: false },
                ],
            },
        },
    },
});

export const Default = meta.story({
    render: args => (
        <UserProfileDialog {...args} user={mockUser}>
            <UserProfileDialogTrigger asChild>
                <Button>{MOCK_USER_BUTTON_OPEN_PROFILE_SETTINGS}</Button>
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
            name: new RegExp(MOCK_USER_BUTTON_OPEN_PROFILE_SETTINGS, "i"),
        });
        expect(trigger).toBeVisible();

        await userEvent.click(trigger);

        await waitForDialog("dialog");
    },
);

Default.test(
    "should render form inside dialog",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_USER_BUTTON_OPEN_PROFILE_SETTINGS, "i"),
        });
        await userEvent.click(trigger);

        await waitForDialog("dialog");

        const form = await waitForElement("form");
        expect(form).toBeInTheDocument();
    },
);

Default.test(
    "should render delete profile dialog inside dialog",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_USER_BUTTON_OPEN_PROFILE_SETTINGS, "i"),
        });
        await userEvent.click(trigger);

        await waitForDialog("dialog");

        const button = getButtonByText(MOCK_USER_BUTTON_DELETE_PROFILE);
        await userEvent.click(button);

        await waitForDialog("alertdialog");
    },
);

Default.test(
    "should render delete all chats dialog inside dialog",
    async ({ canvas, userEvent }) => {
        const trigger = canvas.getByRole("button", {
            name: new RegExp(MOCK_USER_BUTTON_OPEN_PROFILE_SETTINGS, "i"),
        });

        fireEvent.click(trigger);

        await waitForDialog("dialog");

        const deleteAllChatsButton = getButtonByText(
            MOCK_USER_BUTTON_DELETE_ALL_CHATS,
        );
        await userEvent.click(deleteAllChatsButton);

        await waitForDialog("alertdialog");
    },
);
