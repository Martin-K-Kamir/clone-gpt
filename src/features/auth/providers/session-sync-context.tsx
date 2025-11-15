"use client";

import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useMemo } from "react";

import { signOut } from "@/features/auth/services/actions";

import { useUserSessionContext } from "@/features/user/providers";

import type { SyncActionProps } from "@/lib/types";
import { tabScope } from "@/lib/utils";

import { useBroadcastChannel } from "@/hooks";

type LogoutAction = {
    type: "LOGOUT";
};

type SessionSyncContextValue = {
    signOutWithSync: (props?: SyncActionProps) => Promise<void>;
};

export const SessionSyncContext = createContext<SessionSyncContextValue | null>(
    null,
);

export function SessionSyncProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const queryClient = useQueryClient();
    const { setUser } = useUserSessionContext();

    const { postMessage } = useBroadcastChannel<LogoutAction>({
        channelName: "auth-sync",
        onMessage: useCallback(
            (message: LogoutAction) => {
                if (message.type === "LOGOUT") {
                    signOut();
                    queryClient.clear();
                    setUser(null);
                }
            },
            [queryClient, setUser],
        ),
    });

    const signOutWithSync = useCallback(
        async ({ scope }: SyncActionProps = {}) => {
            tabScope(scope, {
                thisTab: async () => {
                    signOut();
                    queryClient.clear();
                    setUser(null);
                },
                otherTabs: () => {
                    postMessage({ type: "LOGOUT" });
                },
            });
        },
        [queryClient, postMessage, setUser],
    );

    const value = useMemo(
        () => ({
            signOutWithSync,
        }),
        [signOutWithSync],
    );

    return <SessionSyncContext value={value}>{children}</SessionSyncContext>;
}

export function useSessionSyncContext() {
    const context = useContext(SessionSyncContext);
    if (!context) {
        throw new Error(
            "useSessionSyncContext must be used within a SessionSyncProvider",
        );
    }
    return context;
}
