import { UserSessionProvider } from "#.storybook/lib/decorators/providers";
import {
    MOCK_USER_CHARACTERISTIC_BUTTON_DIRECT,
    MOCK_USER_CHARACTERISTIC_BUTTON_GEN_Z,
    MOCK_USER_CHARACTERISTIC_BUTTON_QUICK_WIT,
    MOCK_USER_FORM_NAME_TEST,
    MOCK_USER_FORM_NICKNAME,
    MOCK_USER_FORM_ROLE,
    MOCK_USER_FORM_TEST_ID_CHARACTERISTIC_REFRESH_BUTTON,
} from "#.storybook/lib/mocks/user-components";
import {
    MOCK_EMPTY_USER_CHAT_PREFERENCES,
    MOCK_USER_CHAT_PREFERENCES,
    createMockUser,
} from "#.storybook/lib/mocks/users";
import {
    createLoadingUserChatPreferencesHandler,
    createUserChatPreferencesHandler,
} from "#.storybook/lib/msw/handlers";
import { getAllCharacteristicButtons } from "#.storybook/lib/utils/elements";
import { clearAllQueries } from "#.storybook/lib/utils/query-client";
import {
    waitForCharacteristicButtons,
    waitForSonnerToast,
    waitForTestId,
} from "#.storybook/lib/utils/test-helpers";
import preview from "#.storybook/preview";
import { expect, mocked, waitFor } from "storybook/test";

import { upsertUserChatPreferences } from "@/features/user/services/actions/upsert-user-chat-preferences";

import { api } from "@/lib/api-response";

import { UserChatPreferenceForm } from "./user-chat-preference-form";

const mockUser = createMockUser();

const meta = preview.meta({
    component: UserChatPreferenceForm,
    decorators: [
        (Story, { parameters }) => (
            <UserSessionProvider {...parameters.provider}>
                <div className="min-w-md bg-zinc-925 max-w-2xl p-6">
                    <Story />
                </div>
            </UserSessionProvider>
        ),
    ],
    parameters: {
        layout: "centered",
        a11y: {
            config: {
                rules: [
                    { id: "color-contrast", enabled: false },
                    { id: "aria-valid-attr-value", enabled: false },
                ],
            },
        },
        provider: {
            queryProviderKey: "user-chat-preference-form",
        },
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
    },
});

Default.test("should render all form fields", async ({ canvas }) => {
    await waitFor(() => {
        const nicknameInput = canvas.getByTestId(
            "user-chat-preference-form-nickname-input",
        );
        const roleInput = canvas.getByTestId(
            "user-chat-preference-form-role-input",
        );
        const personalitySelectTrigger = canvas.getByTestId(
            "user-chat-preference-form-personality-select-trigger",
        );
        const characteristicsTextarea = canvas.getByTestId(
            "user-chat-preference-form-characteristics-textarea",
        );
        const extraInfoTextarea = canvas.getByTestId(
            "user-chat-preference-form-extraInfo-textarea",
        );

        expect(nicknameInput).toBeVisible();
        expect(roleInput).toBeVisible();
        expect(personalitySelectTrigger).toBeVisible();
        expect(characteristicsTextarea).toBeVisible();
        expect(extraInfoTextarea).toBeVisible();
    });
});

Default.test("should render Save and Reset buttons", async ({ canvas }) => {
    await waitFor(() => {
        expect(canvas.getByRole("button", { name: /save/i })).toBeVisible();
        expect(canvas.getByRole("button", { name: /reset/i })).toBeVisible();
    });
});

Default.test("should load empty preferences from API", async ({ canvas }) => {
    await waitFor(() => {
        expect(
            canvas.getByTestId("user-chat-preference-form-nickname-input"),
        ).toHaveValue("");
    });
});

Default.test(
    "should submit form with valid data",
    async ({ canvas, userEvent }) => {
        const nicknameInput = await waitForTestId(
            canvas,
            "user-chat-preference-form-nickname-input",
        );
        const roleInput = canvas.getByTestId(
            "user-chat-preference-form-role-input",
        );

        await userEvent.type(nicknameInput, MOCK_USER_FORM_NICKNAME);
        await userEvent.type(roleInput, MOCK_USER_FORM_ROLE);
        await userEvent.click(canvas.getByRole("button", { name: /save/i }));

        await waitFor(() => {
            expect(mocked(upsertUserChatPreferences)).toHaveBeenCalled();
        });
    },
);

Default.test(
    "should disable save button while submitting",
    async ({ canvas, userEvent }) => {
        mocked(upsertUserChatPreferences).mockImplementationOnce(
            () =>
                new Promise(resolve =>
                    setTimeout(
                        () =>
                            resolve(
                                api.success.user.updateChatPreferences(
                                    MOCK_USER_CHAT_PREFERENCES,
                                ),
                            ),
                        250,
                    ),
                ),
        );

        const nicknameInput = await waitForTestId(
            canvas,
            "user-chat-preference-form-nickname-input",
        );
        const saveButton = canvas.getByRole("button", { name: /save/i });

        await userEvent.type(nicknameInput, MOCK_USER_FORM_NICKNAME);
        await userEvent.click(saveButton);

        expect(saveButton).toBeDisabled();

        await waitFor(() => {
            expect(saveButton).toBeEnabled();
        });
    },
);

Default.test(
    "should show success toast on successful submit",
    async ({ canvas, userEvent }) => {
        const nicknameInput = await waitForTestId(
            canvas,
            "user-chat-preference-form-nickname-input",
        );
        const roleInput = canvas.getByTestId(
            "user-chat-preference-form-role-input",
        );
        const saveButton = canvas.getByRole("button", { name: /save/i });

        await userEvent.type(nicknameInput, MOCK_USER_FORM_NICKNAME);
        await userEvent.type(roleInput, MOCK_USER_FORM_ROLE);
        await userEvent.click(saveButton);

        await waitFor(() => {
            expect(mocked(upsertUserChatPreferences)).toHaveBeenCalled();
        });

        await waitForSonnerToast();
    },
);

Default.test(
    "should show error toast on failed submit",
    async ({ canvas, userEvent }) => {
        mocked(upsertUserChatPreferences).mockResolvedValue(
            api.error.user.updateChatPreferences(
                new Error("Failed to update preferences"),
            ),
        );
        const nicknameInput = await waitForTestId(
            canvas,
            "user-chat-preference-form-nickname-input",
        );
        const saveButton = canvas.getByRole("button", { name: /save/i });

        await userEvent.type(nicknameInput, MOCK_USER_FORM_NAME_TEST);
        await userEvent.click(saveButton);

        await waitForSonnerToast();
    },
);

Default.test("should reset form fields", async ({ canvas, userEvent }) => {
    const nicknameInput = canvas.getByTestId(
        "user-chat-preference-form-nickname-input",
    );
    const roleInput = canvas.getByTestId(
        "user-chat-preference-form-role-input",
    );
    const resetButton = canvas.getByRole("button", { name: /reset/i });

    await userEvent.click(resetButton);

    await waitFor(() => {
        expect(nicknameInput).toHaveValue("");
        expect(roleInput).toHaveValue("");
    });
});

Default.test("should display characteristic buttons", async () => {
    await waitForCharacteristicButtons();
});

Default.test(
    "should add characteristic description to textarea when button is clicked",
    async ({ canvas, userEvent }) => {
        const genZButton = canvas.getByTestId(
            MOCK_USER_CHARACTERISTIC_BUTTON_GEN_Z,
        );

        const directButton = canvas.getByTestId(
            MOCK_USER_CHARACTERISTIC_BUTTON_DIRECT,
        );

        const quickWitButton = canvas.getByTestId(
            MOCK_USER_CHARACTERISTIC_BUTTON_QUICK_WIT,
        );

        await waitFor(() => {
            expect(genZButton).toBeEnabled();
            expect(directButton).toBeEnabled();
            expect(quickWitButton).toBeEnabled();
        });

        await userEvent.click(genZButton);

        const characteristicsTextarea = canvas.getByTestId(
            "user-chat-preference-form-characteristics-textarea",
        ) as HTMLTextAreaElement;
        const length1 = characteristicsTextarea.value.length;

        expect(length1).toBeGreaterThan(0);
        expect(genZButton).not.toBeVisible();

        await userEvent.click(directButton);

        const length2 = characteristicsTextarea.value.length;

        expect(length2).toBeGreaterThan(length1);
        expect(directButton).not.toBeVisible();

        await userEvent.click(quickWitButton);

        const length3 = characteristicsTextarea.value.length;

        expect(length3).toBeGreaterThan(length2);
        expect(quickWitButton).not.toBeVisible();
    },
);

Default.test(
    "should remove characteristics when clicked and restore them on refresh",
    async ({ canvas, userEvent }) => {
        function getNumberOfCharacteristicsButtons() {
            return getAllCharacteristicButtons().length;
        }

        const genZButton = canvas.getByTestId(
            MOCK_USER_CHARACTERISTIC_BUTTON_GEN_Z,
        );

        const directButton = canvas.getByTestId(
            MOCK_USER_CHARACTERISTIC_BUTTON_DIRECT,
        );

        const quickWitButton = canvas.getByTestId(
            MOCK_USER_CHARACTERISTIC_BUTTON_QUICK_WIT,
        );

        const refreshButton = canvas.getByTestId(
            MOCK_USER_FORM_TEST_ID_CHARACTERISTIC_REFRESH_BUTTON,
        );

        await waitFor(() => {
            expect(genZButton).toBeEnabled();
            expect(directButton).toBeEnabled();
            expect(quickWitButton).toBeEnabled();
            expect(refreshButton).toBeEnabled();

            expect(genZButton).toBeVisible();
            expect(directButton).toBeVisible();
            expect(quickWitButton).toBeVisible();
            expect(refreshButton).toBeVisible();
        });

        const initialNumberOfCharacteristicsButtons =
            getNumberOfCharacteristicsButtons();

        await userEvent.click(genZButton);
        expect(getNumberOfCharacteristicsButtons()).toBe(
            initialNumberOfCharacteristicsButtons - 1,
        );

        await userEvent.click(directButton);
        expect(getNumberOfCharacteristicsButtons()).toBe(
            initialNumberOfCharacteristicsButtons - 2,
        );

        await userEvent.click(quickWitButton);
        expect(getNumberOfCharacteristicsButtons()).toBe(
            initialNumberOfCharacteristicsButtons - 3,
        );

        await userEvent.click(refreshButton);
        expect(getNumberOfCharacteristicsButtons()).toBe(
            initialNumberOfCharacteristicsButtons,
        );
        expect(genZButton).not.toBeVisible();
        expect(directButton).not.toBeVisible();
        expect(quickWitButton).not.toBeVisible();
        expect(refreshButton).toBeVisible();
    },
);

export const WithFilledData = meta.story({
    parameters: {
        msw: {
            handlers: [
                createUserChatPreferencesHandler({
                    preferences: MOCK_USER_CHAT_PREFERENCES,
                }),
            ],
        },
        provider: {
            queryProviderKey: "user-chat-preference-form-with-filled-data",
        },
    },
    beforeEach: () => {
        mocked(upsertUserChatPreferences).mockResolvedValue(
            api.success.user.updateChatPreferences(MOCK_USER_CHAT_PREFERENCES),
        );
    },
    afterEach: () => {
        mocked(upsertUserChatPreferences).mockClear();
    },
    args: {
        user: mockUser,
    },
});

WithFilledData.test(
    "should display pre-filled form data",
    async ({ canvas }) => {
        await waitFor(() => {
            const nicknameInput = canvas.getByTestId(
                "user-chat-preference-form-nickname-input",
            );
            const roleInput = canvas.getByTestId(
                "user-chat-preference-form-role-input",
            );
            const characteristicsTextarea = canvas.getByTestId(
                "user-chat-preference-form-characteristics-textarea",
            );
            const extraInfoTextarea = canvas.getByTestId(
                "user-chat-preference-form-extraInfo-textarea",
            );

            expect(nicknameInput).toHaveValue(
                MOCK_USER_CHAT_PREFERENCES.nickname,
            );
            expect(roleInput).toHaveValue(MOCK_USER_CHAT_PREFERENCES.role);
            expect(characteristicsTextarea).toHaveValue(
                MOCK_USER_CHAT_PREFERENCES.characteristics,
            );
            expect(extraInfoTextarea).toHaveValue(
                MOCK_USER_CHAT_PREFERENCES.extraInfo,
            );
        });
    },
);

export const LoadingState = meta.story({
    name: "Loading State",
    parameters: {
        msw: {
            handlers: [createLoadingUserChatPreferencesHandler()],
        },
        provider: {
            queryProviderKey: "user-chat-preference-form-loading-state",
        },
    },
    beforeEach: () => {
        mocked(upsertUserChatPreferences).mockResolvedValue(
            api.success.user.updateChatPreferences(MOCK_USER_CHAT_PREFERENCES),
        );
    },
    afterEach: () => {
        mocked(upsertUserChatPreferences).mockClear();
    },
    args: {
        user: mockUser,
    },
});

LoadingState.test("should show loading state on inputs", async ({ canvas }) => {
    const nicknameInput = canvas.getByTestId(
        "user-chat-preference-form-nickname-input",
    );
    const roleInput = canvas.getByTestId(
        "user-chat-preference-form-role-input",
    );
    const skeletons = canvas.getAllByTestId("skeleton");

    expect(nicknameInput).toBeDisabled();
    expect(roleInput).toBeDisabled();
    expect(skeletons.length).toBeGreaterThan(0);
});
