import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { signOut } from "@/features/auth/services/actions";

import { useUserSessionContext } from "@/features/user/providers";

import { tabScope } from "@/lib/utils";

import { useBroadcastChannel } from "@/hooks";

import {
    SessionSyncProvider,
    useSessionSyncContext,
} from "./session-sync-context";

vi.mock("@/features/auth/services/actions", () => ({
    signOut: vi.fn(),
}));

vi.mock("@/features/user/providers", () => ({
    useUserSessionContext: vi.fn(),
}));

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

const mockSignOut = vi.mocked(signOut);
const mockUseUserSessionContext = vi.mocked(useUserSessionContext);
const mockUseBroadcastChannel = vi.mocked(useBroadcastChannel);
const mockTabScope = vi.mocked(tabScope);

describe("SessionSyncProvider", () => {
    let queryClient: QueryClient;
    let mockPostMessage: (message: unknown) => void;
    let mockSetUser: ReturnType<typeof vi.fn>;

    const createWrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <SessionSyncProvider>{children}</SessionSyncProvider>
        </QueryClientProvider>
    );

    beforeEach(() => {
        vi.clearAllMocks();
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });

        vi.spyOn(queryClient, "clear");

        mockSetUser = vi.fn();
        mockPostMessage = vi.fn() as (message: unknown) => void;

        mockUseUserSessionContext.mockReturnValue({
            user: null,
            setUser: mockSetUser,
        } as any);

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

    it("should provide signOutWithSync function", () => {
        const { result } = renderHook(() => useSessionSyncContext(), {
            wrapper: createWrapper,
        });

        expect(typeof result.current.signOutWithSync).toBe("function");
    });

    it("should sign out, clear query client, and set user to null for thisTab scope", async () => {
        const { result } = renderHook(() => useSessionSyncContext(), {
            wrapper: createWrapper,
        });

        await act(async () => {
            await result.current.signOutWithSync({ scope: "thisTab" });
        });

        expect(mockSignOut).toHaveBeenCalled();
        expect(queryClient.clear).toHaveBeenCalled();
        expect(mockSetUser).toHaveBeenCalledWith(null);
        expect(mockPostMessage).not.toHaveBeenCalled();
    });

    it("should post logout message to other tabs for otherTabs scope", async () => {
        const { result } = renderHook(() => useSessionSyncContext(), {
            wrapper: createWrapper,
        });

        await act(async () => {
            await result.current.signOutWithSync({ scope: "otherTabs" });
        });

        expect(mockPostMessage).toHaveBeenCalledWith({ type: "LOGOUT" });
        expect(mockSignOut).not.toHaveBeenCalled();
        expect(queryClient.clear).not.toHaveBeenCalled();
        expect(mockSetUser).not.toHaveBeenCalled();
    });

    it("should sign out for thisTab scope when scope is undefined", async () => {
        const { result } = renderHook(() => useSessionSyncContext(), {
            wrapper: createWrapper,
        });

        await act(async () => {
            await result.current.signOutWithSync();
        });

        expect(mockSignOut).toHaveBeenCalled();
        expect(queryClient.clear).toHaveBeenCalled();
        expect(mockSetUser).toHaveBeenCalledWith(null);
    });

    it("should handle logout broadcast message", () => {
        let capturedOnMessage: ((message: unknown) => void) | undefined;

        mockUseBroadcastChannel.mockImplementation((options: any) => {
            capturedOnMessage = options.onMessage;
            return {
                postMessage: mockPostMessage,
                isConnected: true,
            };
        });

        renderHook(() => useSessionSyncContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            capturedOnMessage?.({ type: "LOGOUT" });
        });

        expect(mockSignOut).toHaveBeenCalled();
        expect(queryClient.clear).toHaveBeenCalled();
        expect(mockSetUser).toHaveBeenCalledWith(null);
    });
});

describe("useSessionSyncContext", () => {
    it("should throw error when used outside provider", () => {
        expect(() => {
            renderHook(() => useSessionSyncContext());
        }).toThrow(
            "useSessionSyncContext must be used within a SessionSyncProvider",
        );
    });
});
