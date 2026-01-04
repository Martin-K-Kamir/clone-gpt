"use client";

import { useCallback, useState } from "react";

type UseCopyTableToClipboardOptions = Partial<{
    onError: (error: string) => void;
    copyResetDelay: number;
}>;

export function useCopyTableToClipboard(
    tableRef: React.RefObject<HTMLTableElement | null>,
    options?: UseCopyTableToClipboardOptions,
) {
    const { onError, copyResetDelay = 2000 } = options || {};

    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const copyTable = useCallback(async () => {
        if (!navigator?.clipboard) {
            const message = "Clipboard API not supported";
            setError(message);
            setCopied(false);
            onError?.(message);
            return false;
        }

        try {
            const tableClone = tableRef.current?.cloneNode(
                true,
            ) as HTMLTableElement;

            const style = document.createElement("style");
            style.textContent = `
                    table { border-collapse: collapse; width: 100%; }
                    th, td { border: 1px solid #374151; padding: 8px; text-align: left; }
                    th { font-weight: bold; }
                `;

            const wrapper = document.createElement("div");
            wrapper.appendChild(style);
            wrapper.appendChild(tableClone);

            const htmlData = new ClipboardItem({
                "text/html": new Blob([wrapper.outerHTML], {
                    type: "text/html",
                }),
                "text/plain": new Blob([tableRef.current?.textContent || ""], {
                    type: "text/plain",
                }),
            });

            await navigator.clipboard.write([htmlData]);
            setCopied(true);
            setError(null);
            setTimeout(() => setCopied(false), copyResetDelay);
            return true;
        } catch {
            try {
                const tableText = tableRef.current?.textContent || "";
                await navigator.clipboard.writeText(tableText);
                setCopied(true);
                setError(null);
                setTimeout(() => setCopied(false), copyResetDelay);
                return true;
            } catch (fallbackErr: unknown) {
                const message =
                    typeof fallbackErr === "object" &&
                    fallbackErr !== null &&
                    "message" in fallbackErr &&
                    typeof fallbackErr.message === "string"
                        ? fallbackErr.message
                        : "Failed to copy table";

                setError(message);
                setCopied(false);
                onError?.(message);
                return false;
            }
        }
    }, [onError, copyResetDelay, tableRef]);

    return { copyTable, copied, error };
}
