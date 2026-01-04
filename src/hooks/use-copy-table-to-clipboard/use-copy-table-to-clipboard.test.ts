import { renderHook, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCopyTableToClipboard } from "./use-copy-table-to-clipboard";

describe("useCopyTableToClipboard", () => {
    const mockWrite = vi.fn();
    const mockWriteText = vi.fn();
    const originalClipboard = navigator.clipboard;
    const originalClipboardItem = global.ClipboardItem;

    beforeEach(() => {
        vi.clearAllMocks();

        global.ClipboardItem = class MockClipboardItem {
            constructor(public items: Record<string, Blob>) {}
            async getType(type: string) {
                return this.items[type];
            }
        } as any;

        Object.defineProperty(navigator, "clipboard", {
            value: {
                write: mockWrite,
                writeText: mockWriteText,
            },
            writable: true,
            configurable: true,
        });
    });

    afterEach(() => {
        Object.defineProperty(navigator, "clipboard", {
            value: originalClipboard,
            writable: true,
            configurable: true,
        });
        global.ClipboardItem = originalClipboardItem as any;
    });

    const createTable = (html?: string) => {
        const table = document.createElement("table");
        if (html) {
            table.innerHTML = html;
        } else {
            const row = document.createElement("tr");
            const cell = document.createElement("td");
            cell.textContent = "Test";
            row.appendChild(cell);
            table.appendChild(row);
        }
        document.body.appendChild(table);
        return table;
    };

    it("returns initial state", () => {
        const tableRef = createRef<HTMLTableElement>();
        const { result } = renderHook(() => useCopyTableToClipboard(tableRef));

        expect(result.current.copied).toBe(false);
        expect(result.current.error).toBeNull();
        expect(typeof result.current.copyTable).toBe("function");
    });

    it("copies table as HTML and plain text successfully", async () => {
        mockWrite.mockResolvedValue(undefined);

        const table = createTable();
        const tableRef = createRef<HTMLTableElement>();
        tableRef.current = table;

        const { result } = renderHook(() => useCopyTableToClipboard(tableRef));

        const success = await result.current.copyTable();

        expect(success).toBe(true);
        await waitFor(() => {
            expect(result.current.copied).toBe(true);
        });
        expect(result.current.error).toBeNull();

        document.body.removeChild(table);
    });

    it("falls back to plain text when HTML copy fails", async () => {
        mockWrite.mockRejectedValue(new Error("HTML copy failed"));
        mockWriteText.mockResolvedValue(undefined);

        const table = document.createElement("table");
        table.textContent = "Fallback text";
        document.body.appendChild(table);

        const tableRef = createRef<HTMLTableElement>();
        tableRef.current = table;

        const { result } = renderHook(() => useCopyTableToClipboard(tableRef));

        const success = await result.current.copyTable();

        expect(success).toBe(true);
        await waitFor(() => {
            expect(result.current.copied).toBe(true);
        });

        document.body.removeChild(table);
    });

    it("handles clipboard API not available", async () => {
        const onError = vi.fn();
        Object.defineProperty(navigator, "clipboard", {
            value: undefined,
            writable: true,
            configurable: true,
        });

        const tableRef = createRef<HTMLTableElement>();
        const { result } = renderHook(() =>
            useCopyTableToClipboard(tableRef, { onError }),
        );

        const success = await result.current.copyTable();

        expect(success).toBe(false);
        expect(result.current.copied).toBe(false);
        await waitFor(() => {
            expect(result.current.error).toBe("Clipboard API not supported");
            expect(onError).toHaveBeenCalledWith("Clipboard API not supported");
        });
    });

    it("handles both HTML and fallback copy failures", async () => {
        const error = new Error("Copy failed");
        mockWrite.mockRejectedValue(error);
        mockWriteText.mockRejectedValue(error);

        const table = document.createElement("table");
        table.textContent = "Test";
        document.body.appendChild(table);

        const tableRef = createRef<HTMLTableElement>();
        tableRef.current = table;

        const { result } = renderHook(() => useCopyTableToClipboard(tableRef));

        const success = await result.current.copyTable();

        expect(success).toBe(false);
        expect(result.current.copied).toBe(false);
        await waitFor(() => {
            expect(result.current.error).toBe("Copy failed");
        });

        document.body.removeChild(table);
    });

    it("handles error without message in fallback", async () => {
        mockWrite.mockRejectedValue(new Error("HTML failed"));
        mockWriteText.mockRejectedValue({});

        const table = document.createElement("table");
        table.textContent = "Test";
        document.body.appendChild(table);

        const tableRef = createRef<HTMLTableElement>();
        tableRef.current = table;

        const { result } = renderHook(() => useCopyTableToClipboard(tableRef));

        const success = await result.current.copyTable();

        expect(success).toBe(false);
        await waitFor(() => {
            expect(result.current.error).toBe("Failed to copy table");
        });

        document.body.removeChild(table);
    });

    it("sets copied to false after delay", async () => {
        vi.useFakeTimers();
        mockWrite.mockResolvedValue(undefined);

        const table = createTable();
        const tableRef = createRef<HTMLTableElement>();
        tableRef.current = table;

        const { result } = renderHook(() =>
            useCopyTableToClipboard(tableRef, { copyResetDelay: 100 }),
        );

        const promise = result.current.copyTable();
        vi.runAllTimersAsync();
        await promise;

        await waitFor(() => {
            expect(result.current.copied).toBe(true);
        });

        vi.advanceTimersByTime(100);
        vi.runAllTimers();

        await waitFor(() => {
            expect(result.current.copied).toBe(false);
        });

        document.body.removeChild(table);
        vi.useRealTimers();
    });

    it("handles null table ref", async () => {
        mockWrite.mockRejectedValue(new Error("ClipboardItem failed"));
        mockWriteText.mockResolvedValue(undefined);

        const tableRef = createRef<HTMLTableElement>();

        const { result } = renderHook(() => useCopyTableToClipboard(tableRef));

        const success = await result.current.copyTable();

        expect(success).toBe(true);
        await waitFor(() => {
            expect(result.current.copied).toBe(true);
        });
    });

    it("calls onError on copy failure", async () => {
        const onError = vi.fn();
        const error = new Error("Copy error");
        mockWrite.mockRejectedValue(error);
        mockWriteText.mockRejectedValue(error);

        const table = document.createElement("table");
        document.body.appendChild(table);

        const tableRef = createRef<HTMLTableElement>();
        tableRef.current = table;

        const { result } = renderHook(() =>
            useCopyTableToClipboard(tableRef, { onError }),
        );

        await result.current.copyTable();

        expect(onError).toHaveBeenCalledWith("Copy error");

        document.body.removeChild(table);
    });
});
