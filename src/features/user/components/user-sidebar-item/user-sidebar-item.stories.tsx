import preview from "#.storybook/preview";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HttpResponse, http } from "msw";
import { useEffect, useMemo } from "react";
import { expect, mocked, waitFor } from "storybook/test";

import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";

import { SessionSyncProvider } from "@/features/auth/providers";

import {
    ChatCacheSyncProvider,
    ChatOffsetProvider,
} from "@/features/chat/providers";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
import type { DBUserId, UIUser } from "@/features/user/lib/types";
import {
    UserCacheSyncProvider,
    UserSessionProvider,
} from "@/features/user/providers";
import { updateUserName } from "@/features/user/services/actions/update-user-name";

import { api } from "@/lib/api-response";
import { getFirstTwoCapitalLetters } from "@/lib/utils";

import { UserSidebarItemClient } from "./user-sidebar-item-client";

const mockUserId = "00000000-0000-0000-0000-000000000001" as DBUserId;

const mockUserImage = "https://picsum.photos/id/107/200/200";
const mockGuestUserName = "Guest User";
const mockUser: UIUser = {
    id: mockUserId,
    name: "John Doe",
    email: "john.doe@example.com",
    role: USER_ROLE.USER,
    image: null,
};

const mockDBUser = {
    id: mockUserId,
    name: "John Doe",
    email: "john.doe@example.com",
    role: USER_ROLE.USER,
    image: null,
    password: null,
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
    const queryClient = useMemo(() => createQueryClient(), [storyKey]);

    useEffect(() => {
        queryClient.clear();
    }, [queryClient, storyKey]);

    return (
        <QueryClientProvider client={queryClient} key={storyKey}>
            <UserSessionProvider>
                <SessionSyncProvider>
                    <ChatOffsetProvider>
                        <ChatCacheSyncProvider>
                            <UserCacheSyncProvider>
                                <SidebarProvider>
                                    <div className="bg-zinc-925 w-64 p-4">
                                        <Story />
                                    </div>
                                </SidebarProvider>
                                <Toaster />
                            </UserCacheSyncProvider>
                        </ChatCacheSyncProvider>
                    </ChatOffsetProvider>
                </SessionSyncProvider>
            </UserSessionProvider>
        </QueryClientProvider>
    );
};

const meta = preview.meta({
    component: UserSidebarItemClient,
    decorators: [
        (Story, context) => (
            <StoryWrapper Story={Story} storyKey={context.name || context.id} />
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
            handlers: [
                http.get("/api/user", () => {
                    return HttpResponse.json(api.success.user.get(mockDBUser));
                }),
            ],
        },
    },
    beforeEach: () => {
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

        await waitFor(() => {
            const menu = document.querySelector('[role="menu"]');
            expect(menu).toBeInTheDocument();
        });
    },
);

export const WithImage = meta.story({
    parameters: {
        msw: {
            handlers: [
                http.get("/api/user", () => {
                    return HttpResponse.json(
                        api.success.user.get({
                            ...mockDBUser,
                            image: mockUserImage,
                        }),
                    );
                }),
            ],
        },
    },
    beforeEach: () => {
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
                http.get("/api/user", () => {
                    return HttpResponse.json(
                        api.success.user.get({
                            ...mockDBUser,
                            role: USER_ROLE.GUEST,
                            name: mockGuestUserName,
                        }),
                    );
                }),
            ],
        },
    },
    beforeEach: () => {
        mocked(updateUserName).mockResolvedValue(
            api.success.user.updateName(mockGuestUserName),
        );
    },
    afterEach: () => {
        mocked(updateUserName).mockClear();
    },
    args: {
        user: {
            ...mockUser,
            name: mockGuestUserName,
            role: USER_ROLE.GUEST,
        },
    },
});

WithGuestUser.test(
    "should only show name for guest user",
    async ({ canvas }) => {
        await waitFor(() => {
            const nameContainer = canvas.getByTestId(
                "user-sidebar-item-name-container",
            );
            const name = canvas.getByText(mockGuestUserName);

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

        await waitFor(() => {
            const menu = document.querySelector('[role="menu"]');
            expect(menu).toBeInTheDocument();
        });

        const menuItems = document.querySelectorAll('[role="menuitem"]');
        const menuTexts = Array.from(menuItems).map(item => item.textContent);

        expect(menuTexts.some(text => text?.includes("Log in"))).toBe(true);
        expect(menuTexts.some(text => text?.includes("User Settings"))).toBe(
            false,
        );
        expect(menuTexts.some(text => text?.includes("Log out"))).toBe(false);
    },
);

export const WithLongName = meta.story({
    parameters: {
        msw: {
            handlers: [
                http.get("/api/user", () => {
                    return HttpResponse.json(
                        api.success.user.get({
                            ...mockDBUser,
                            name: "Very Long User Name That Should Be Truncated",
                        }),
                    );
                }),
            ],
        },
    },
    beforeEach: () => {
        mocked(updateUserName).mockResolvedValue(
            api.success.user.updateName(
                "Very Long User Name That Should Be Truncated",
            ),
        );
    },
    afterEach: () => {
        mocked(updateUserName).mockClear();
    },
    args: {
        user: {
            ...mockUser,
            name: "Very Long User Name That Should Be Truncated",
        },
    },
});
