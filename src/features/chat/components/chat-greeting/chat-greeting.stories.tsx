import { UserSessionProvider } from "#.storybook/lib/decorators/providers";
import {
    createMockGuestUser,
    createMockUser,
} from "#.storybook/lib/mocks/users";
import preview from "#.storybook/preview";
import { expect } from "storybook/test";

import { ChatGreeting } from "./chat-greeting";

const meta = preview.meta({
    component: ChatGreeting,
    args: {
        as: "h1",
    },
    decorators: [
        (Story, { parameters }) => {
            return (
                <UserSessionProvider {...parameters.provider}>
                    <Story />
                </UserSessionProvider>
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

export const Default = meta.story({
    parameters: {
        provider: {
            user: createMockUser(),
        },
    },
});

Default.test("should render greeting for regular user", async ({ canvas }) => {
    const greeting = canvas.getByText(
        /Good (morning|afternoon|evening), John!/,
    );
    expect(greeting).toBeInTheDocument();
});

export const GuestUser = meta.story({
    parameters: {
        provider: {
            user: createMockGuestUser(),
        },
    },
});

GuestUser.test("should render greeting for guest user", async ({ canvas }) => {
    const greeting = canvas.getByText(
        /Good (morning|afternoon|evening), there!/,
    );
    expect(greeting).toBeInTheDocument();
});

export const NoUser = meta.story({
    parameters: {
        provider: {
            user: null,
        },
    },
});

NoUser.test("should not render when no user", async ({ canvas }) => {
    const greeting = canvas.queryByText(/Good (morning|afternoon|evening)/);
    expect(greeting).not.toBeInTheDocument();
});
