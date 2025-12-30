import { AppProviders } from "#.storybook/lib/decorators/providers";
import {
    MOCK_USER_FORM_NAME_ORIGINAL,
    MOCK_USER_FORM_NAME_TOO_LONG,
    MOCK_USER_FORM_NAME_UPDATED,
} from "#.storybook/lib/mocks/user-components";
import { createMockUser } from "#.storybook/lib/mocks/users";
import {
    waitForSonnerToast,
    waitForTestId,
} from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect, mocked, waitFor } from "storybook/test";

import { updateUserName } from "@/features/user/services/actions/update-user-name";

import { api } from "@/lib/api-response";

import { UserProfileForm } from "./user-profile-form";

const mockUser = createMockUser();

const meta = preview.meta({
    component: UserProfileForm,
    decorators: [
        (Story, { parameters }) => (
            <AppProviders {...parameters.provider}>
                <div className="min-w-md bg-zinc-925 max-w-2xl p-6">
                    <Story />
                </div>
            </AppProviders>
        ),
    ],
    parameters: {
        layout: "centered",
    },
    argTypes: {
        user: {
            description: "The user object",
            table: {
                type: {
                    summary: "UIUser",
                },
            },
        },
    },
});

export const Default = meta.story({
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
    },
});

Default.test("should render all form fields", async ({ canvas }) => {
    await waitFor(() => {
        const nameInput = canvas.getByTestId("user-profile-form-name-input");
        const emailInput = canvas.getByTestId("user-profile-form-email-input");
        const updateButton = canvas.getByRole("button", {
            name: /update profile/i,
        });

        expect(nameInput).toBeVisible();
        expect(emailInput).toBeVisible();
        expect(updateButton).toBeVisible();
    });
});

Default.test("should display user data in form fields", async ({ canvas }) => {
    await waitFor(() => {
        const nameInput = canvas.getByTestId("user-profile-form-name-input");
        const emailInput = canvas.getByTestId("user-profile-form-email-input");

        expect(nameInput).toHaveValue(mockUser.name);
        expect(emailInput).toHaveValue(mockUser.email);
    });
});

Default.test("should have email field disabled", async ({ canvas }) => {
    await waitFor(() => {
        const emailInput = canvas.getByTestId("user-profile-form-email-input");
        expect(emailInput).toBeDisabled();
    });
});

Default.test(
    "should disable submit button when name hasn't changed",
    async ({ canvas }) => {
        await waitFor(() => {
            const updateButton = canvas.getByRole("button", {
                name: /update profile/i,
            });
            expect(updateButton).toBeDisabled();
        });
    },
);

Default.test(
    "should enable submit button when name is changed",
    async ({ canvas, userEvent }) => {
        const nameInput = await waitForTestId(
            canvas,
            "user-profile-form-name-input",
        );
        const updateButton = canvas.getByRole("button", {
            name: /update profile/i,
        });

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, MOCK_USER_FORM_NAME_UPDATED);

        await waitFor(() => {
            expect(updateButton).toBeEnabled();
        });
    },
);

Default.test(
    "should submit form with updated name",
    async ({ canvas, userEvent }) => {
        const nameInput = await waitForTestId(
            canvas,
            "user-profile-form-name-input",
        );
        const updateButton = canvas.getByRole("button", {
            name: /update profile/i,
        });

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, MOCK_USER_FORM_NAME_UPDATED);
        await userEvent.click(updateButton);

        await waitFor(() => {
            expect(mocked(updateUserName)).toHaveBeenCalledWith({
                newName: MOCK_USER_FORM_NAME_UPDATED,
            });
        });
    },
);

Default.test(
    "should show success toast on successful update",
    async ({ canvas, userEvent }) => {
        const nameInput = canvas.getByTestId("user-profile-form-name-input");
        const updateButton = canvas.getByRole("button", {
            name: /update profile/i,
        });

        await waitFor(() => {
            expect(nameInput).toBeVisible();
        });

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, MOCK_USER_FORM_NAME_UPDATED);
        await userEvent.click(updateButton);

        await waitForSonnerToast();
    },
);

Default.test(
    "should disable submit button while submitting",
    async ({ canvas, userEvent }) => {
        mocked(updateUserName).mockImplementationOnce(
            () =>
                new Promise(resolve =>
                    setTimeout(
                        () =>
                            resolve(
                                api.success.user.updateName(
                                    MOCK_USER_FORM_NAME_UPDATED,
                                ),
                            ),
                        100,
                    ),
                ),
        );

        const nameInput = await waitForTestId(
            canvas,
            "user-profile-form-name-input",
        );
        const updateButton = canvas.getByRole("button", {
            name: /update profile/i,
        });

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, MOCK_USER_FORM_NAME_UPDATED);
        await userEvent.click(updateButton);

        expect(updateButton).toBeDisabled();
    },
);

Default.test(
    "should show error toast on failed update",
    async ({ canvas, userEvent }) => {
        mocked(updateUserName).mockResolvedValueOnce(
            api.error.user.updateName(new Error("Failed to update name")),
        );

        const nameInput = await waitForTestId(
            canvas,
            "user-profile-form-name-input",
        );
        const updateButton = canvas.getByRole("button", {
            name: /update profile/i,
        });

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, MOCK_USER_FORM_NAME_UPDATED);
        await userEvent.click(updateButton);

        await waitForSonnerToast();
    },
);

Default.test(
    "should disable button again after reverting name to original",
    async ({ canvas, userEvent }) => {
        const nameInput = await waitForTestId(
            canvas,
            "user-profile-form-name-input",
        );
        const updateButton = canvas.getByRole("button", {
            name: /update profile/i,
        });

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, MOCK_USER_FORM_NAME_UPDATED);

        await waitFor(() => {
            expect(updateButton).toBeEnabled();
        });

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, MOCK_USER_FORM_NAME_ORIGINAL);

        await waitFor(() => {
            expect(updateButton).toBeDisabled();
        });
    },
);

Default.test(
    "should show error message when name is too long",
    async ({ canvas, userEvent }) => {
        const nameInput = await waitForTestId(
            canvas,
            "user-profile-form-name-input",
        );
        const updateButton = canvas.getByRole("button", {
            name: /update profile/i,
        });

        await userEvent.type(nameInput, MOCK_USER_FORM_NAME_TOO_LONG);
        await userEvent.click(updateButton);

        await waitFor(() => {
            const errorMessage = canvas.getByTestId(
                "user-profile-form-name-error-message",
            );
            expect(errorMessage).toBeInTheDocument();
            expect(updateButton.textContent.length).toBeGreaterThan(0);
        });
    },
);
