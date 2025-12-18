import preview from "#.storybook/preview";
import { QueryProvider } from "@/providers/query-provider";
import { expect, waitFor } from "storybook/test";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
import type { DBUserId, UIUser } from "@/features/user/lib/types";
import { UserSessionContext } from "@/features/user/providers";

import { ChatGreeting } from "./chat-greeting";

const meta = preview.meta({
    component: ChatGreeting,
    args: {
        as: "h1",
    },
    decorators: [
        (Story, { parameters }) => {
            const mockUser =
                (parameters.user as UIUser | null | undefined) ?? null;

            return (
                <QueryProvider>
                    <UserSessionContext.Provider
                        value={{
                            user: mockUser,
                            setUser: () => {},
                        }}
                    >
                        <Story />
                    </UserSessionContext.Provider>
                </QueryProvider>
            );
        },
    ],
    parameters: {
        a11y: {
            disable: true,
        },
        layout: "centered",
    },
    argTypes: {
        as: {
            control: "select",
            description: "The component to render as",
            options: ["h1", "h2", "h3", "div", "span", "p"],
            table: {
                type: {
                    summary: "string | React.ComponentType",
                },
                defaultValue: {
                    summary: "h2",
                },
            },
        },
        className: {
            control: "text",
            description: "Additional CSS classes",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
    },
});

const mockRegularUser: UIUser = {
    id: "user-1" as DBUserId,
    name: "John Doe",
    email: "john@example.com",
    image: null,
    role: USER_ROLE.USER,
};

const mockGuestUser: UIUser = {
    id: "guest-1" as DBUserId,
    name: "Guest User",
    email: "guest@example.com",
    image: null,
    role: USER_ROLE.GUEST,
};

export const Default = meta.story({
    name: "Default (Regular User)",
    parameters: {
        user: mockRegularUser,
    },
});

Default.test("should render greeting for regular user", async ({ canvas }) => {
    await waitFor(() => {
        const greeting = canvas.getByText(
            /Good (morning|afternoon|evening), John!/,
        );
        expect(greeting).toBeVisible();
    });
});

export const GuestUser = meta.story({
    name: "Guest User",
    parameters: {
        user: mockGuestUser,
    },
});

GuestUser.test("should render greeting for guest user", async ({ canvas }) => {
    await waitFor(() => {
        const greeting = canvas.getByText(
            /Good (morning|afternoon|evening), there!/,
        );
        expect(greeting).toBeVisible();
    });
});

export const NoUser = meta.story({
    name: "No User",
    parameters: {
        user: null,
    },
});

NoUser.test("should not render when no user", async ({ canvas }) => {
    await waitFor(() => {
        const greeting = canvas.queryByText(/Good (morning|afternoon|evening)/);
        expect(greeting).not.toBeInTheDocument();
    });
});
