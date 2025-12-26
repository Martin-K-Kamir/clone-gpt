import preview from "#.storybook/preview";
import { QueryProvider } from "@/providers/query-provider";
import { expect, mocked } from "storybook/test";

import { Toaster } from "@/components/ui/sonner";

import { signUp } from "@/features/auth/services/actions";

import type { DBUserId, DBUserRole } from "@/features/user/lib/types";

import { api } from "@/lib/api-response";

import Page from "./page";

const meta = preview.meta({
    component: Page,
    decorators: [
        Story => (
            <QueryProvider>
                <Story />
                <Toaster />
            </QueryProvider>
        ),
    ],
    parameters: {
        layout: "fullscreen",
    },
});

export const Default = meta.story({
    args: {},
    beforeEach: () => {
        mocked(signUp).mockResolvedValue(
            api.success.auth.signup({
                id: "00000000-0000-0000-0000-000000000000" as DBUserId,
                email: "test@example.com",
                name: "Test User",
                image: null,
                role: "user" as DBUserRole,
            }),
        );
    },
    afterEach: () => {
        mocked(signUp).mockClear();
    },
});

Default.test("should render heading", async ({ canvas }) => {
    const heading = canvas.getByRole("heading", {
        level: 1,
    });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent.length).toBeGreaterThan(0);
});

Default.test("should render sign up form", async ({ canvas }) => {
    const form = document.querySelector("form");
    expect(form).toBeInTheDocument();
});

Default.test("should render sign in link", async ({ canvas, userEvent }) => {
    const signInLink = canvas.getByRole("link", {
        name: /sign in/i,
    });
    expect(signInLink).toBeInTheDocument();
    expect(signInLink).toBeEnabled();
    expect(signInLink).toHaveAttribute("href", "/signin");

    let clicked = false;
    signInLink.addEventListener("click", e => {
        e.preventDefault();
        clicked = true;
    });

    await userEvent.click(signInLink);

    expect(clicked).toBe(true);
});
