import preview from "#.storybook/preview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { expect, mocked, waitFor } from "storybook/test";

import { Toaster } from "@/components/ui/sonner";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
import type { DBUserId, UIUser } from "@/features/user/lib/types";
import { UserCacheSyncProvider } from "@/features/user/providers";
import { updateUserName } from "@/features/user/services/actions/update-user-name";

import { api } from "@/lib/api-response";

import { UserProfileForm } from "./user-profile-form";

const mockUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;

const mockUser: UIUser = {
    id: mockUserId,
    name: "John Doe",
    email: "john.doe@example.com",
    role: USER_ROLE.USER,
    image: null,
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
    component: UserProfileForm,
    decorators: [
        (Story, context) => (
            <StoryWrapper Story={Story} storyKey={context.name || context.id} />
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
        const nameInput = canvas.getByTestId("user-profile-form-name-input");
        const updateButton = canvas.getByRole("button", {
            name: /update profile/i,
        });

        await waitFor(() => {
            expect(nameInput).toBeVisible();
        });

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, "Jane Doe");

        await waitFor(() => {
            expect(updateButton).toBeEnabled();
        });
    },
);

Default.test(
    "should submit form with updated name",
    async ({ canvas, userEvent }) => {
        const nameInput = canvas.getByTestId("user-profile-form-name-input");
        const updateButton = canvas.getByRole("button", {
            name: /update profile/i,
        });

        await waitFor(() => {
            expect(nameInput).toBeVisible();
        });

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, "Jane Doe");
        await userEvent.click(updateButton);

        await waitFor(() => {
            expect(mocked(updateUserName)).toHaveBeenCalledWith({
                newName: "Jane Doe",
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
        await userEvent.type(nameInput, "Jane Doe");
        await userEvent.click(updateButton);

        await waitFor(() => {
            const toast = document.querySelector("[data-sonner-toast]");
            expect(toast).toBeInTheDocument();
        });
    },
);

Default.test(
    "should disable submit button while submitting",
    async ({ canvas, userEvent }) => {
        mocked(updateUserName).mockImplementationOnce(
            () =>
                new Promise(resolve =>
                    setTimeout(
                        () => resolve(api.success.user.updateName("Jane Doe")),
                        100,
                    ),
                ),
        );

        const nameInput = canvas.getByTestId("user-profile-form-name-input");
        const updateButton = canvas.getByRole("button", {
            name: /update profile/i,
        });

        await waitFor(() => {
            expect(nameInput).toBeVisible();
        });

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, "Jane Doe");
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

        const nameInput = canvas.getByTestId("user-profile-form-name-input");
        const updateButton = canvas.getByRole("button", {
            name: /update profile/i,
        });

        await waitFor(() => {
            expect(nameInput).toBeVisible();
        });

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, "Jane Doe");
        await userEvent.click(updateButton);

        await waitFor(() => {
            const toast = document.querySelector("[data-sonner-toast]");
            expect(toast).toBeInTheDocument();
        });
    },
);

Default.test(
    "should disable button again after reverting name to original",
    async ({ canvas, userEvent }) => {
        const nameInput = canvas.getByTestId("user-profile-form-name-input");
        const updateButton = canvas.getByRole("button", {
            name: /update profile/i,
        });

        await waitFor(() => {
            expect(nameInput).toBeVisible();
        });

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, "Jane Doe");

        await waitFor(() => {
            expect(updateButton).toBeEnabled();
        });

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, mockUser.name);

        await waitFor(() => {
            expect(updateButton).toBeDisabled();
        });
    },
);

Default.test(
    "should show error message when name is too long",
    async ({ canvas, userEvent }) => {
        const nameInput = canvas.getByTestId("user-profile-form-name-input");
        const updateButton = canvas.getByRole("button", {
            name: /update profile/i,
        });

        await waitFor(() => {
            expect(nameInput).toBeVisible();
        });

        await userEvent.type(nameInput, "A".repeat(51));
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
