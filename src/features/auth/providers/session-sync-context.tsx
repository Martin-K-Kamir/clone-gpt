"use client";

import { useQueryClient } from "@tanstack/react-query";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
} from "react";
import { toast } from "sonner";

import { signOut } from "@/features/auth/services/actions";

type SessionSyncContextValue = {
    signOutWithSync: () => Promise<void>;
};

export const SessionSyncContext = createContext<SessionSyncContextValue | null>(
    null,
);

export function SessionSyncProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const broadcastChannel = useRef<BroadcastChannel | null>(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        if (
            typeof window !== "undefined" &&
            typeof BroadcastChannel !== "undefined"
        ) {
            try {
                broadcastChannel.current = new BroadcastChannel("auth-sync");

                broadcastChannel.current.onmessage = (event: MessageEvent) => {
                    if (event.data.type === "LOGOUT") {
                        signOut();
                        queryClient.clear();
                    }
                };
            } catch {
                toast.error("Failed to initialize session sync");
            }
        }

        return () => {
            broadcastChannel.current?.close();
        };
    }, [queryClient]);

    const signOutWithSync = useCallback(async () => {
        if (
            typeof window !== "undefined" &&
            typeof BroadcastChannel !== "undefined"
        ) {
            try {
                const channel = new BroadcastChannel("auth-sync");
                channel.postMessage({ type: "LOGOUT" });
                channel.close();
            } catch (error) {
                console.log("BroadcastChannel failed:", error);
            }
        }
    }, []);

    return (
        <SessionSyncContext value={{ signOutWithSync }}>
            {children}
        </SessionSyncContext>
    );
}

export function useSessionSync() {
    const context = useContext(SessionSyncContext);
    if (!context) {
        throw new Error(
            "useSessionSync must be used within a SessionSyncProvider",
        );
    }
    return context;
}
