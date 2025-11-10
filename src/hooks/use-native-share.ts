"use client";

import { useCallback } from "react";

interface UseNativeShareOptions {
    onShare: () => { title?: string; text?: string; url?: string };
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

interface UseNativeShareReturn {
    canShare: boolean;
    share: () => Promise<boolean>;
}

export function useNativeShare(
    options: UseNativeShareOptions,
): UseNativeShareReturn {
    const { onShare, onSuccess, onError } = options;
    const canShare = typeof navigator !== "undefined" && "share" in navigator;

    const share = useCallback(async (): Promise<boolean> => {
        if (!canShare) {
            return false;
        }

        try {
            const shareData = onShare();
            await navigator.share(shareData);
            onSuccess?.();
            return true;
        } catch (error) {
            if (error instanceof Error && error.name !== "AbortError") {
                onError?.(error);
            }
            return false;
        }
    }, [canShare, onShare, onSuccess, onError]);

    return {
        canShare,
        share,
    };
}
