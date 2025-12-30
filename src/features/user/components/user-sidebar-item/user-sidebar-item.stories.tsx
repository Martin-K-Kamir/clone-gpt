import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    MOCK_USER_MENU_LOG_IN,
    MOCK_USER_MENU_LOG_OUT,
    MOCK_USER_MENU_USER_SETTINGS,
    MOCK_USER_NAME_GUEST,
    MOCK_USER_NAME_LONG,
} from "#.storybook/lib/mocks/user-components";
import {
    createMockDBUser,
    createMockGuestUser,
    createMockUser,
} from "#.storybook/lib/mocks/users";
import { createUserHandler } from "#.storybook/lib/msw/handlers";
import { hasMenuItemWithText } from "#.storybook/lib/utils/elements";
import { clearAllQueries } from "#.storybook/lib/utils/query-client";
import { waitForDropdownMenu } from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect, mocked, waitFor } from "storybook/test";

import { SidebarProvider } from "@/components/ui/sidebar";

import { updateUserName } from "@/features/user/services/actions/update-user-name";

import { api } from "@/lib/api-response";
import { getFirstTwoCapitalLetters } from "@/lib/utils";

import { UserSidebarItemClient } from "./user-sidebar-item-client";

const mockUser = createMockUser();
const mockUserImage = "https://picsum.photos/id/107/200/200";
const mockDBUser = createMockDBUser();

const meta = preview.meta({
    component: UserSidebarItemClient,
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <SidebarProvider>
                    <div className="bg-zinc-925 w-64 p-4">
                        <Story />
                    </div>
                </SidebarProvider>
            </AppProviders>
        ),
    ],
    argTypes: {
        user: {
            description: "The initial user object",
            table: {
                type: {
                    summary: "UIUser",
                },
            },
        },
    },
    args: {
        user: mockUser,
    },
});

export const Default = meta.story({
    parameters: {
        msw: {
            handlers: [createUserHandler({ user: mockDBUser })],
        },
    },
    beforeEach: () => {
        clearAllQueries();
        mocked(updateUserName).mockResolvedValue(
            api.success.user.updateName(mockUser.name),
        );
    },
    afterEach: () => {
        mocked(updateUserName).mockClear();
    },
});

Default.test("should render user name", async ({ canvas }) => {
    await waitFor(() => {
        const name = canvas.getByText(mockUser.name);
        expect(name).toBeInTheDocument();
    });
});

Default.test("should render user email", async ({ canvas }) => {
    await waitFor(() => {
        const email = canvas.getByText(mockUser.email);
        expect(email).toBeInTheDocument();
    });
});

Default.test("should render avatar with fallback", async ({ canvas }) => {
    await waitFor(() => {
        const avatar = canvas.getByText(
            getFirstTwoCapitalLetters(mockUser.name),
        );
        expect(avatar).toBeInTheDocument();
    });
});

Default.test(
    "should open dropdown menu when button is clicked",
    async ({ canvas, userEvent }) => {
        await waitFor(() => {
            const button = canvas.getByRole("button");
            expect(button).toBeInTheDocument();
        });

        const button = canvas.getByRole("button");
        await userEvent.click(button);

        await waitForDropdownMenu();
    },
);

export const WithImage = meta.story({
    parameters: {
        msw: {
            handlers: [
                createUserHandler({
                    user: { ...mockDBUser, image: mockUserImage },
                }),
            ],
        },
    },
    beforeEach: () => {
        clearAllQueries();
        mocked(updateUserName).mockResolvedValue(
            api.success.user.updateName(mockUser.name),
        );
    },
    afterEach: () => {
        mocked(updateUserName).mockClear();
    },
    args: {
        user: {
            ...mockUser,
            image: mockUserImage,
        },
    },
});

WithImage.test(
    "should render avatar image when provided",
    async ({ canvas }) => {
        await waitFor(() => {
            const avatarImage = canvas.getByAltText(mockUser.name);
            expect(avatarImage).toBeInTheDocument();
            expect(avatarImage).toHaveAttribute("src", mockUserImage);
        });
    },
);

export const WithGuestUser = meta.story({
    parameters: {
        msw: {
            handlers: [
                createUserHandler({
                    user: {
                        ...mockDBUser,
                        role: mockUser.role,
                        name: MOCK_USER_NAME_GUEST,
                    },
                }),
            ],
        },
    },
    beforeEach: () => {
        clearAllQueries();
        mocked(updateUserName).mockResolvedValue(
            api.success.user.updateName(MOCK_USER_NAME_GUEST),
        );
    },
    afterEach: () => {
        mocked(updateUserName).mockClear();
    },
    args: {
        user: createMockGuestUser({ name: MOCK_USER_NAME_GUEST }),
    },
});

WithGuestUser.test(
    "should only show name for guest user",
    async ({ canvas }) => {
        await waitFor(() => {
            const nameContainer = canvas.getByTestId(
                "user-sidebar-item-name-container",
            );
            const name = canvas.getByText(MOCK_USER_NAME_GUEST);

            expect(nameContainer).toBeInTheDocument();
            expect(nameContainer.children).toHaveLength(1);
            expect(name).toBeInTheDocument();
        });
    },
);

WithGuestUser.test(
    "should show login option and hide settings/logout for guest",
    async ({ canvas, userEvent }) => {
        await waitFor(() => {
            const button = canvas.getByRole("button");
            expect(button).toBeInTheDocument();
        });

        const button = canvas.getByRole("button");
        await userEvent.click(button);

        await waitForDropdownMenu();

        expect(hasMenuItemWithText(MOCK_USER_MENU_LOG_IN)).toBe(true);
        expect(hasMenuItemWithText(MOCK_USER_MENU_USER_SETTINGS)).toBe(false);
        expect(hasMenuItemWithText(MOCK_USER_MENU_LOG_OUT)).toBe(false);
    },
);

export const WithLongName = meta.story({
    parameters: {
        msw: {
            handlers: [
                createUserHandler({
                    user: {
                        ...mockDBUser,
                        name: MOCK_USER_NAME_LONG,
                    },
                }),
            ],
        },
    },
    beforeEach: () => {
        clearAllQueries();
        mocked(updateUserName).mockResolvedValue(
            api.success.user.updateName(MOCK_USER_NAME_LONG),
        );
    },
    afterEach: () => {
        mocked(updateUserName).mockClear();
    },
    args: {
        user: {
            ...mockUser,
            name: MOCK_USER_NAME_LONG,
        },
    },
});
