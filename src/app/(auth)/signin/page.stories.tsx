import preview from "#.storybook/preview";
import { QueryProvider } from "@/providers/query-provider";
import { expect, mocked } from "storybook/test";

import { Toaster } from "@/components/ui/sonner";

import { signInWithCredentials } from "@/features/auth/services/actions";

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
        mocked(signInWithCredentials).mockResolvedValue(
            api.success.auth.signin(null),
        );
    },
    afterEach: () => {
        mocked(signInWithCredentials).mockClear();
    },
});

Default.test("should render heading", async ({ canvas }) => {
    const heading = canvas.getByRole("heading", {
        level: 1,
    });
    expect(heading).toBeInTheDocument();
    expect(heading.textContent.length).toBeGreaterThan(0);
});

Default.test("should render sign in form", async ({ canvas }) => {
    const form = document.querySelector("form");
    expect(form).toBeInTheDocument();
});

Default.test("should render sign up link", async ({ canvas, userEvent }) => {
    const signUpLink = canvas.getByRole("link", {
        name: /sign up/i,
    });
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toBeEnabled();
    expect(signUpLink).toHaveAttribute("href", "/signup");

    let clicked = false;
    signUpLink.addEventListener("click", e => {
        e.preventDefault();
        clicked = true;
    });

    await userEvent.click(signUpLink);

    expect(clicked).toBe(true);
});
