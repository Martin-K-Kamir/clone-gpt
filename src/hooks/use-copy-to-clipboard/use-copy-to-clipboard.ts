"use client";

import { useCallback, useState } from "react";

type UseCopyToClipboardOptions = Partial<{
    onError: (error: string) => void;
    copyResetDelay: number;
}>;

export function useCopyToClipboard(options?: UseCopyToClipboardOptions) {
    const { onError, copyResetDelay = 2000 } = options || {};

    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const copy = useCallback(
        async (text: string) => {
            if (!navigator?.clipboard) {
                const message = "Clipboard API not supported";
                setError(message);
                setCopied(false);
                onError?.(message);
                return false;
            }

            try {
                await navigator.clipboard.writeText(text);
                setCopied(true);
                setError(null);
                setTimeout(() => setCopied(false), copyResetDelay);
                return true;
            } catch (err: unknown) {
                const message =
                    typeof err === "object" &&
                    err !== null &&
                    "message" in err &&
                    typeof err.message === "string"
                        ? err.message
                        : "Failed to copy";

                setError(message);
                setCopied(false);
                onError?.(message);
                return false;
            }
        },
        [onError, copyResetDelay],
    );

    return { copy, copied, error };
}
