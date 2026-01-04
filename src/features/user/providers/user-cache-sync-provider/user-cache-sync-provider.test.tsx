import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
    DBUser,
    DBUserChatPreferences,
    DBUserId,
} from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tag";
import { tabScope } from "@/lib/utils";

import { useBroadcastChannel } from "@/hooks";

import {
    UserCacheSyncProvider,
    useUserCacheSyncContext,
} from "./user-cache-sync-provider";

vi.mock("@/hooks", () => ({
    useBroadcastChannel: vi.fn(),
}));

vi.mock("@/lib/utils", async () => {
    const actual = await vi.importActual("@/lib/utils");
    return {
        ...actual,
        tabScope: vi.fn(),
    };
});

const mockUseBroadcastChannel = vi.mocked(useBroadcastChannel);
const mockTabScope = vi.mocked(tabScope);

describe("UserCacheSyncProvider", () => {
    let queryClient: QueryClient;
    let mockPostMessage: (message: unknown) => void;

    const createWrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <UserCacheSyncProvider>{children}</UserCacheSyncProvider>
        </QueryClientProvider>
    );

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });

        mockPostMessage = vi.fn() as (message: unknown) => void;

        mockUseBroadcastChannel.mockReturnValue({
            postMessage: mockPostMessage,
            isConnected: true,
        });

        mockTabScope.mockImplementation((scope, handlers) => {
            if (
                scope === "thisTab" ||
                scope === "both" ||
                scope === undefined
            ) {
                handlers.thisTab?.();
            }
            if (scope === "otherTabs" || scope === "both") {
                handlers.otherTabs?.();
            }
        });
    });

    it("provides all cache sync functions", () => {
        const { result } = renderHook(() => useUserCacheSyncContext(), {
            wrapper: createWrapper,
        });

        expect(typeof result.current.updateUserName).toBe("function");
        expect(typeof result.current.revertLastUserUpdate).toBe("function");
        expect(typeof result.current.updateUserChatPreferences).toBe(
            "function",
        );
    });

    it("throws error when used outside provider", () => {
        expect(() => {
            renderHook(() => useUserCacheSyncContext());
        }).toThrow(
            "useUserCacheSyncContext must be used within a UserCacheSyncProvider",
        );
    });

    it("updateUserName updates user name for thisTab scope", () => {
        const userId = "user-123" as DBUserId;
        const newName = "New Name";
        const oldUser: DBUser = {
            id: userId,
            name: "Old Name",
        } as DBUser;

        queryClient.setQueryData([tag.user(userId)], oldUser);

        const { result } = renderHook(() => useUserCacheSyncContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            result.current.updateUserName({
                userId,
                newName,
                scope: "thisTab",
            });
        });

        const updatedUser = queryClient.getQueryData<DBUser>([
            tag.user(userId),
        ]);
        expect(updatedUser?.name).toBe(newName);
    });

    it("updateUserName broadcasts message for otherTabs scope", () => {
        const userId = "user-123" as DBUserId;
        const newName = "New Name";

        mockTabScope.mockImplementation((scope, handlers) => {
            if (scope === "otherTabs") {
                handlers.otherTabs?.();
            }
        });

        const { result } = renderHook(() => useUserCacheSyncContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            result.current.updateUserName({
                userId,
                newName,
                scope: "otherTabs",
            });
        });

        expect(mockPostMessage).toHaveBeenCalledWith({
            type: "updateUserName",
            data: { userId, newName },
        });
    });

    it("updateUserName returns revert function that restores previous name", () => {
        const userId = "user-123" as DBUserId;
        const oldName = "Old Name";
        const newName = "New Name";
        const oldUser: DBUser = {
            id: userId,
            name: oldName,
        } as DBUser;

        queryClient.setQueryData([tag.user(userId)], oldUser);

        const { result } = renderHook(() => useUserCacheSyncContext(), {
            wrapper: createWrapper,
        });

        let revertFn: (() => void) | undefined;

        act(() => {
            revertFn = result.current.updateUserName({
                userId,
                newName,
                scope: "thisTab",
            });
        });

        expect(queryClient.getQueryData<DBUser>([tag.user(userId)])?.name).toBe(
            newName,
        );

        act(() => {
            revertFn?.();
        });

        const revertedUser = queryClient.getQueryData<DBUser>([
            tag.user(userId),
        ]);
        expect(revertedUser?.name).toBe(oldName);
    });

    it("revertLastUserUpdate restores previous user state for thisTab scope", () => {
        const userId = "user-123" as DBUserId;
        const oldName = "Old Name";
        const newName = "New Name";
        const oldUser: DBUser = {
            id: userId,
            name: oldName,
        } as DBUser;

        queryClient.setQueryData([tag.user(userId)], oldUser);

        const { result } = renderHook(() => useUserCacheSyncContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            result.current.updateUserName({
                userId,
                newName,
                scope: "thisTab",
            });
        });

        expect(queryClient.getQueryData<DBUser>([tag.user(userId)])?.name).toBe(
            newName,
        );

        act(() => {
            result.current.revertLastUserUpdate({ scope: "thisTab" });
        });

        const revertedUser = queryClient.getQueryData<DBUser>([
            tag.user(userId),
        ]);
        expect(revertedUser?.name).toBe(oldName);
    });

    it("revertLastUserUpdate broadcasts message for otherTabs scope", () => {
        mockTabScope.mockImplementation((scope, handlers) => {
            if (scope === "otherTabs") {
                handlers.otherTabs?.();
            }
        });

        const { result } = renderHook(() => useUserCacheSyncContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            result.current.revertLastUserUpdate({ scope: "otherTabs" });
        });

        expect(mockPostMessage).toHaveBeenCalledWith({
            type: "revertLastUserUpdate",
        });
    });

    it("revertLastUserUpdate works with default scope", () => {
        const { result } = renderHook(() => useUserCacheSyncContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            result.current.revertLastUserUpdate();
        });

        expect(mockTabScope).toHaveBeenCalled();
    });

    it("updateUserChatPreferences updates preferences for thisTab scope", () => {
        const userId = "user-123" as DBUserId;
        const newNickname = "Test User";
        const preferences: Partial<DBUserChatPreferences> = {
            nickname: newNickname,
        };
        const oldPreferences: DBUserChatPreferences = {
            id: "pref-123",
            userId,
            nickname: "Old Nickname",
            personality: "FRIENDLY",
            createdAt: new Date().toISOString(),
            role: null,
            extraInfo: null,
            characteristics: null,
        } as DBUserChatPreferences;

        queryClient.setQueryData(
            [tag.userChatPreferences(userId)],
            oldPreferences,
        );

        const { result } = renderHook(() => useUserCacheSyncContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            result.current.updateUserChatPreferences({
                userId,
                userChatPreferences: preferences,
                scope: "thisTab",
            });
        });

        const updated = queryClient.getQueryData<DBUserChatPreferences>([
            tag.userChatPreferences(userId),
        ]);
        expect(updated?.nickname).toBe(newNickname);
    });

    it("updateUserChatPreferences broadcasts message for otherTabs scope", () => {
        const userId = "user-123" as DBUserId;
        const preferences: Partial<DBUserChatPreferences> = {
            nickname: "Test User",
        };

        mockTabScope.mockImplementation((scope, handlers) => {
            if (scope === "otherTabs") {
                handlers.otherTabs?.();
            }
        });

        const { result } = renderHook(() => useUserCacheSyncContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            result.current.updateUserChatPreferences({
                userId,
                userChatPreferences: preferences,
                scope: "otherTabs",
            });
        });

        expect(mockPostMessage).toHaveBeenCalledWith({
            type: "updateUserChatPreferences",
            data: { userId, userChatPreferences: preferences },
        });
    });

    it("updates user name when receiving updateUserName broadcast message", () => {
        const userId = "user-123" as DBUserId;
        const oldName = "Old Name";
        const newName = "New Name";
        const oldUser: DBUser = {
            id: userId,
            name: oldName,
        } as DBUser;

        queryClient.setQueryData([tag.user(userId)], oldUser);

        let onMessageHandler: ((message: any) => void) | undefined;

        renderHook(() => useUserCacheSyncContext(), {
            wrapper: createWrapper,
        });

        onMessageHandler = mockUseBroadcastChannel.mock.calls[0][0].onMessage;

        act(() => {
            onMessageHandler?.({
                type: "updateUserName",
                data: { userId, newName },
            });
        });

        const updatedUser = queryClient.getQueryData<DBUser>([
            tag.user(userId),
        ]);
        expect(updatedUser?.name).toBe(newName);
    });

    it("reverts user state when receiving revertLastUserUpdate broadcast message", () => {
        const userId = "user-123" as DBUserId;
        const oldName = "Old Name";
        const newName = "New Name";
        const oldUser: DBUser = {
            id: userId,
            name: oldName,
        } as DBUser;

        queryClient.setQueryData([tag.user(userId)], oldUser);

        const { result } = renderHook(() => useUserCacheSyncContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            result.current.updateUserName({
                userId,
                newName,
                scope: "thisTab",
            });
        });

        expect(queryClient.getQueryData<DBUser>([tag.user(userId)])?.name).toBe(
            newName,
        );

        const onMessageHandler =
            mockUseBroadcastChannel.mock.calls[0][0].onMessage;

        act(() => {
            onMessageHandler?.({
                type: "revertLastUserUpdate",
            });
        });

        const revertedUser = queryClient.getQueryData<DBUser>([
            tag.user(userId),
        ]);
        expect(revertedUser?.name).toBe(oldName);
    });

    it("updates preferences when receiving updateUserChatPreferences broadcast message", () => {
        const userId = "user-123" as DBUserId;
        const oldNickname = "Old Nickname";
        const newNickname = "Updated Nickname";
        const preferences: Partial<DBUserChatPreferences> = {
            nickname: newNickname,
        };
        const oldPreferences: DBUserChatPreferences = {
            id: "pref-123",
            userId,
            nickname: oldNickname,
            personality: "FRIENDLY",
            createdAt: new Date().toISOString(),
            role: null,
            extraInfo: null,
            characteristics: null,
        } as DBUserChatPreferences;

        queryClient.setQueryData(
            [tag.userChatPreferences(userId)],
            oldPreferences,
        );

        let onMessageHandler: ((message: any) => void) | undefined;

        renderHook(() => useUserCacheSyncContext(), {
            wrapper: createWrapper,
        });

        onMessageHandler = mockUseBroadcastChannel.mock.calls[0][0].onMessage;

        act(() => {
            onMessageHandler?.({
                type: "updateUserChatPreferences",
                data: { userId, userChatPreferences: preferences },
            });
        });

        const updated = queryClient.getQueryData<DBUserChatPreferences>([
            tag.userChatPreferences(userId),
        ]);
        expect(updated?.nickname).toBe(newNickname);
    });

    it("throws error on unknown message type", () => {
        let onMessageHandler: ((message: any) => void) | undefined;

        renderHook(() => useUserCacheSyncContext(), {
            wrapper: createWrapper,
        });

        onMessageHandler = mockUseBroadcastChannel.mock.calls[0][0].onMessage;

        expect(() => {
            act(() => {
                onMessageHandler?.({
                    type: "unknownType",
                } as any);
            });
        }).toThrow("Exhaustive check failed");
    });
});
