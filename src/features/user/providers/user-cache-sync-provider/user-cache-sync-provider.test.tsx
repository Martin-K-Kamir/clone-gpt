import { generateUserId } from "@/vitest/helpers/generate-test-ids";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DBUser, DBUserChatPreferences } from "@/features/user/lib/types";

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

    it("should provide all cache sync functions", () => {
        const { result } = renderHook(() => useUserCacheSyncContext(), {
            wrapper: createWrapper,
        });

        expect(typeof result.current.updateUserName).toBe("function");
        expect(typeof result.current.revertLastUserUpdate).toBe("function");
        expect(typeof result.current.updateUserChatPreferences).toBe(
            "function",
        );
    });

    it("should throw error when used outside provider", () => {
        expect(() => {
            renderHook(() => useUserCacheSyncContext());
        }).toThrow(
            "useUserCacheSyncContext must be used within a UserCacheSyncProvider",
        );
    });

    it("should update user name for thisTab scope when updateUserName is called", () => {
        const userId = generateUserId();
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

    it("should broadcast message for otherTabs scope when updateUserName is called", () => {
        const userId = generateUserId();
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

    it("should return revert function that restores previous name when updateUserName is called", () => {
        const userId = generateUserId();
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

    it("should restore previous user state for thisTab scope when revertLastUserUpdate is called", () => {
        const userId = generateUserId();
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

    it("should broadcast message for otherTabs scope when revertLastUserUpdate is called", () => {
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

    it("should work with default scope when revertLastUserUpdate is called", () => {
        const { result } = renderHook(() => useUserCacheSyncContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            result.current.revertLastUserUpdate();
        });

        expect(mockTabScope).toHaveBeenCalled();
    });

    it("should update preferences for thisTab scope when updateUserChatPreferences is called", () => {
        const userId = generateUserId();
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

    it("should broadcast message for otherTabs scope when updateUserChatPreferences is called", () => {
        const userId = generateUserId();
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

    it("should update user name when receiving updateUserName broadcast message", () => {
        const userId = generateUserId();
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

    it("should revert user state when receiving revertLastUserUpdate broadcast message", () => {
        const userId = generateUserId();
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

    it("should update preferences when receiving updateUserChatPreferences broadcast message", () => {
        const userId = generateUserId();
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

    it("should throw error on unknown message type", () => {
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
