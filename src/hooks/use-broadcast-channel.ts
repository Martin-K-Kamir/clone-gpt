"use client";

import { useCallback, useEffect, useRef } from "react";

type UseBroadcastChannelOptions<TMessage> = {
    channelName: string;
    onMessage?: (message: TMessage) => void;
    enabled?: boolean;
};

export function useBroadcastChannel<TMessage>({
    channelName,
    onMessage,
    enabled = true,
}: UseBroadcastChannelOptions<TMessage>) {
    const broadcastChannel = useRef<BroadcastChannel | null>(null);
    const isProcessingRef = useRef(false);

    const postMessage = useCallback(
        (message: TMessage) => {
            if (broadcastChannel.current && enabled) {
                broadcastChannel.current.postMessage(message);
            }
        },
        [enabled],
    );

    useEffect(() => {
        if (
            !enabled ||
            typeof window === "undefined" ||
            typeof BroadcastChannel === "undefined"
        ) {
            return;
        }

        try {
            broadcastChannel.current = new BroadcastChannel(channelName);

            broadcastChannel.current.onmessage = (
                event: MessageEvent<TMessage>,
            ) => {
                if (isProcessingRef.current) return;

                isProcessingRef.current = true;

                try {
                    onMessage?.(event.data);
                } finally {
                    isProcessingRef.current = false;
                }
            };
        } catch (error) {
            console.error("Failed to create BroadcastChannel:", error);
        }

        return () => {
            broadcastChannel.current?.close();
        };
    }, [channelName, onMessage, enabled]);

    return {
        postMessage,
        isConnected: !!broadcastChannel.current,
    };
}
