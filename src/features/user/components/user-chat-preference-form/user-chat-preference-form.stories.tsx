import preview from "#.storybook/preview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HttpResponse, http } from "msw";
import { useEffect } from "react";
import { expect, mocked, waitFor } from "storybook/test";

import { Toaster } from "@/components/ui/sonner";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
import type {
    DBUserChatPreferences,
    DBUserId,
    UIUser,
} from "@/features/user/lib/types";
import { UserCacheSyncProvider } from "@/features/user/providers";
import { upsertUserChatPreferences } from "@/features/user/services/actions/upsert-user-chat-preferences";

import { api } from "@/lib/api-response";

import { UserChatPreferenceForm } from "./user-chat-preference-form";

const mockUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;

const mockUser: UIUser = {
    id: mockUserId,
    name: "John Doe",
    email: "john.doe@example.com",
    role: USER_ROLE.USER,
    image: null,
};

const mockUserChatPreferences: DBUserChatPreferences = {
    id: "00000000-0000-0000-0000-000000000010",
    userId: mockUserId,
    nickname: "Johnny",
    role: "Software Engineer",
    personality: "FRIENDLY",
    characteristics: "Quick Wit, Direct",
    extraInfo: "I love coding and playing guitar",
    createdAt: new Date().toISOString(),
};

const emptyPreferences: DBUserChatPreferences = {
    id: "00000000-0000-0000-0000-000000000011",
    userId: mockUserId,
    nickname: null,
    role: null,
    personality: "FRIENDLY",
    characteristics: null,
    extraInfo: null,
    createdAt: new Date().toISOString(),
};

function createQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                gcTime: 0,
                staleTime: 0,
            },
        },
    });
}

const StoryWrapper = ({
    Story,
    storyKey,
}: {
    Story: React.ComponentType<any>;
    storyKey?: string;
}) => {
    const queryClient = createQueryClient();

    useEffect(() => {
        queryClient.clear();
    }, [queryClient, storyKey]);

    return (
        <QueryClientProvider client={queryClient} key={storyKey}>
            <UserCacheSyncProvider>
                <div className="min-w-md bg-zinc-925 max-w-2xl p-6">
                    <Story />
                    <Toaster />
                </div>
            </UserCacheSyncProvider>
        </QueryClientProvider>
    );
};

const meta = preview.meta({
    component: UserChatPreferenceForm,
    decorators: [
        (Story, context) => (
            <StoryWrapper Story={Story} storyKey={context.name || context.id} />
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
    name: "Default (Empty Form)",
    parameters: {
        msw: {
            handlers: [
                http.get("/api/user/chat-preferences", () => {
                    return HttpResponse.json(
                        api.success.user.getChatPreferences(emptyPreferences),
                    );
                }),
            ],
        },
    },
    beforeEach: () => {
        // Clear any cached query data
        const queryClient = createQueryClient();
        queryClient.clear();
        mocked(upsertUserChatPreferences).mockResolvedValue(
            api.success.user.updateChatPreferences(emptyPreferences),
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
        expect(
            canvas.getByTestId("user-chat-preference-form-nickname-input"),
        ).toBeVisible();
        expect(
            canvas.getByTestId("user-chat-preference-form-role-input"),
        ).toBeVisible();
        expect(
            canvas.getByTestId(
                "user-chat-preference-form-personality-select-trigger",
            ),
        ).toBeVisible();
        expect(
            canvas.getByTestId(
                "user-chat-preference-form-characteristics-textarea",
            ),
        ).toBeVisible();
        expect(
            canvas.getByTestId("user-chat-preference-form-extraInfo-textarea"),
        ).toBeVisible();
    });
});

Default.test("should render Save and Reset buttons", async ({ canvas }) => {
    await waitFor(() => {
        const saveButton = canvas.getByRole("button", { name: /save/i });
        const resetButton = canvas.getByRole("button", { name: /reset/i });

        expect(saveButton).toBeVisible();
        expect(resetButton).toBeVisible();
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
        const nicknameInput = canvas.getByTestId(
            "user-chat-preference-form-nickname-input",
        );
        const roleInput = canvas.getByTestId(
            "user-chat-preference-form-role-input",
        );
        const saveButton = canvas.getByRole("button", { name: /save/i });

        await waitFor(() => {
            expect(nicknameInput).toBeVisible();
        });

        await userEvent.type(nicknameInput, "Jane");
        await userEvent.type(roleInput, "Designer");
        await userEvent.click(saveButton);

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
                                    mockUserChatPreferences,
                                ),
                            ),
                        250,
                    ),
                ),
        );

        const nicknameInput = canvas.getByTestId(
            "user-chat-preference-form-nickname-input",
        );
        const saveButton = canvas.getByRole("button", { name: /save/i });

        await waitFor(() => {
            expect(nicknameInput).toBeVisible();
        });

        await userEvent.type(nicknameInput, "Jane");
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
        const nicknameInput = canvas.getByTestId(
            "user-chat-preference-form-nickname-input",
        );
        const roleInput = canvas.getByTestId(
            "user-chat-preference-form-role-input",
        );
        const saveButton = canvas.getByRole("button", { name: /save/i });

        await waitFor(() => {
            expect(nicknameInput).toBeVisible();
        });

        await userEvent.type(nicknameInput, "Jane");
        await userEvent.type(roleInput, "Designer");
        await userEvent.click(saveButton);

        await waitFor(() => {
            expect(mocked(upsertUserChatPreferences)).toHaveBeenCalled();
        });

        await waitFor(() => {
            const toast = document.querySelector("[data-sonner-toast]");
            expect(toast).toBeVisible();
        });
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
        const nicknameInput = canvas.getByTestId(
            "user-chat-preference-form-nickname-input",
        );
        const saveButton = canvas.getByRole("button", { name: /save/i });

        await waitFor(() => {
            expect(nicknameInput).toBeVisible();
        });

        await userEvent.type(nicknameInput, "Test");
        await userEvent.click(saveButton);

        await waitFor(() => {
            const toast = document.querySelector("[data-sonner-toast]");
            expect(toast).toBeVisible();
        });
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
    await waitFor(() => {
        const characteristicButtons = document.querySelectorAll(
            "[data-testid^='user-chat-preference-form-characteristic-button-']",
        );
        expect(characteristicButtons.length).toBeGreaterThan(0);
    });
});

Default.test(
    "should add characteristic description to textarea when button is clicked",
    async ({ canvas, userEvent }) => {
        const genZButton = canvas.getByTestId(
            "user-chat-preference-form-characteristic-button-GEN_Z",
        );

        const directButton = canvas.getByTestId(
            "user-chat-preference-form-characteristic-button-DIRECT",
        );

        const quickWitButton = canvas.getByTestId(
            "user-chat-preference-form-characteristic-button-QUICK_WIT",
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
        const lenght1 = characteristicsTextarea.value.length;

        expect(lenght1).toBeGreaterThan(0);
        expect(genZButton).not.toBeVisible();

        await userEvent.click(directButton);

        const lenght2 = characteristicsTextarea.value.length;

        expect(lenght2).toBeGreaterThan(lenght1);
        expect(directButton).not.toBeVisible();

        await userEvent.click(quickWitButton);

        const lenght3 = characteristicsTextarea.value.length;

        expect(lenght3).toBeGreaterThan(lenght2);
        expect(quickWitButton).not.toBeVisible();
    },
);

Default.test(
    "should remove characteristics when clicked and restore them on refresh",
    async ({ canvas, userEvent }) => {
        function getNumberOfCharacteristicsButtons() {
            const characteristicButtons = document.querySelectorAll(
                "[data-testid^='user-chat-preference-form-characteristic-button-']",
            );
            return characteristicButtons.length;
        }

        const genZButton = canvas.getByTestId(
            "user-chat-preference-form-characteristic-button-GEN_Z",
        );

        const directButton = canvas.getByTestId(
            "user-chat-preference-form-characteristic-button-DIRECT",
        );

        const quickWitButton = canvas.getByTestId(
            "user-chat-preference-form-characteristic-button-QUICK_WIT",
        );

        const refreshButton = canvas.getByTestId(
            "user-chat-preference-form-characteristic-refresh-button",
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
                http.get("/api/user/chat-preferences", () => {
                    return HttpResponse.json(
                        api.success.user.getChatPreferences(
                            mockUserChatPreferences,
                        ),
                    );
                }),
            ],
        },
    },
    beforeEach: () => {
        mocked(upsertUserChatPreferences).mockResolvedValue(
            api.success.user.updateChatPreferences(mockUserChatPreferences),
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
                mockUserChatPreferences.nickname || "",
            );
            expect(roleInput).toHaveValue(mockUserChatPreferences.role || "");
            expect(characteristicsTextarea).toHaveValue(
                mockUserChatPreferences.characteristics || "",
            );
            expect(extraInfoTextarea).toHaveValue(
                mockUserChatPreferences.extraInfo || "",
            );
        });
    },
);

export const LoadingState = meta.story({
    name: "Loading State",
    parameters: {
        msw: {
            handlers: [
                http.get("/api/user/chat-preferences", async () => {
                    await new Promise(resolve => setTimeout(resolve, 5_000));
                    return HttpResponse.json(
                        api.success.user.getChatPreferences(
                            mockUserChatPreferences,
                        ),
                    );
                }),
            ],
        },
    },
    beforeEach: () => {
        mocked(upsertUserChatPreferences).mockResolvedValue(
            api.success.user.updateChatPreferences(mockUserChatPreferences),
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
    expect(
        canvas.getByTestId("user-chat-preference-form-nickname-input"),
    ).toBeDisabled();
    expect(
        canvas.getByTestId("user-chat-preference-form-role-input"),
    ).toBeDisabled();

    expect(canvas.getAllByTestId("skeleton").length).toBeGreaterThan(0);
});
