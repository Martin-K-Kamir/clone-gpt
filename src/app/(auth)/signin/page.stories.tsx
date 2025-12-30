import { QueryProvider } from "#.storybook/lib/decorators/providers";
import {
    MOCK_APP_LINK_SIGN_UP,
    MOCK_APP_ROUTE_SIGNUP,
} from "#.storybook/lib/mocks/app";
import { getForm } from "#.storybook/lib/utils/elements";
import { clickLinkAndVerify } from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect, mocked } from "storybook/test";

import { signInWithCredentials } from "@/features/auth/services/actions";

import { api } from "@/lib/api-response";

import Page from "./page";

const meta = preview.meta({
    component: Page,
    decorators: [
        (Story, { parameters }) => (
            <QueryProvider {...parameters.provider}>
                <Story />
            </QueryProvider>
        ),
    ],
    parameters: {
        layout: "fullscreen",
    },
});

export const Default = meta.story({
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
    expect(getForm()).toBeInTheDocument();
});

Default.test("should render sign up link", async ({ canvas, userEvent }) => {
    const signUpLink = canvas.getByRole("link", {
        name: new RegExp(MOCK_APP_LINK_SIGN_UP, "i"),
    });
    expect(signUpLink).toBeInTheDocument();
    expect(signUpLink).toBeEnabled();

    await clickLinkAndVerify(signUpLink, userEvent, MOCK_APP_ROUTE_SIGNUP);
});
