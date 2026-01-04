import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCopyToClipboard } from "./use-copy-to-clipboard";

describe("useCopyToClipboard", () => {
    const mockWriteText = vi.fn();
    const originalClipboard = navigator.clipboard;

    beforeEach(() => {
        vi.clearAllMocks();
        Object.defineProperty(navigator, "clipboard", {
            value: {
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
    });

    it("returns initial state", () => {
        const { result } = renderHook(() => useCopyToClipboard());

        expect(result.current.copied).toBe(false);
        expect(result.current.error).toBeNull();
        expect(typeof result.current.copy).toBe("function");
    });

    it("copies text to clipboard successfully", async () => {
        mockWriteText.mockResolvedValue(undefined);

        const { result } = renderHook(() => useCopyToClipboard());

        const success = await result.current.copy("test text");

        expect(success).toBe(true);
        await waitFor(() => {
            expect(result.current.copied).toBe(true);
        });
        expect(result.current.error).toBeNull();
    });

    it("sets copied to false after delay", async () => {
        vi.useFakeTimers();
        mockWriteText.mockResolvedValue(undefined);

        const { result } = renderHook(() =>
            useCopyToClipboard({ copyResetDelay: 100 }),
        );

        const promise = result.current.copy("test");
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

        vi.useRealTimers();
    });

    it("uses default delay of 2000ms", async () => {
        vi.useFakeTimers();
        mockWriteText.mockResolvedValue(undefined);

        const { result } = renderHook(() => useCopyToClipboard());

        const promise = result.current.copy("test");
        vi.runAllTimersAsync();
        await promise;

        await waitFor(() => {
            expect(result.current.copied).toBe(true);
        });

        vi.advanceTimersByTime(1999);
        vi.runAllTimers();
        expect(result.current.copied).toBe(true);

        vi.advanceTimersByTime(1);
        vi.runAllTimers();

        await waitFor(() => {
            expect(result.current.copied).toBe(false);
        });

        vi.useRealTimers();
    });

    it("handles clipboard API not available", async () => {
        Object.defineProperty(navigator, "clipboard", {
            value: undefined,
            writable: true,
            configurable: true,
        });

        const onError = vi.fn();
        const { result } = renderHook(() => useCopyToClipboard({ onError }));

        const success = await result.current.copy("test");

        expect(success).toBe(false);
        expect(result.current.copied).toBe(false);
        await waitFor(() => {
            expect(result.current.error).toBe("Clipboard API not supported");
            expect(onError).toHaveBeenCalledWith("Clipboard API not supported");
        });
    });

    it("handles copy failure with error message", async () => {
        const error = new Error("Permission denied");
        mockWriteText.mockRejectedValue(error);

        const onError = vi.fn();
        const { result } = renderHook(() => useCopyToClipboard({ onError }));

        const success = await result.current.copy("test");

        expect(success).toBe(false);
        await waitFor(() => {
            expect(result.current.copied).toBe(false);
            expect(result.current.error).toBe("Permission denied");
            expect(onError).toHaveBeenCalledWith("Permission denied");
        });
    });

    it("handles copy failure with generic error when no message", async () => {
        mockWriteText.mockRejectedValue({});

        const { result } = renderHook(() => useCopyToClipboard());

        const success = await result.current.copy("test");

        expect(success).toBe(false);
        await waitFor(() => {
            expect(result.current.copied).toBe(false);
            expect(result.current.error).toBe("Failed to copy");
        });
    });

    it("clears previous error on successful copy", async () => {
        mockWriteText
            .mockRejectedValueOnce(new Error("First error"))
            .mockResolvedValueOnce(undefined);

        const { result } = renderHook(() => useCopyToClipboard());

        await result.current.copy("test");
        await waitFor(() => {
            expect(result.current.error).toBe("First error");
        });

        await result.current.copy("test2");
        await waitFor(() => {
            expect(result.current.error).toBeNull();
            expect(result.current.copied).toBe(true);
        });
    });

    it("maintains separate state for multiple hook instances", async () => {
        mockWriteText.mockResolvedValue(undefined);

        const { result: result1 } = renderHook(() => useCopyToClipboard());
        const { result: result2 } = renderHook(() => useCopyToClipboard());

        await result1.current.copy("text1");

        await waitFor(() => {
            expect(result1.current.copied).toBe(true);
        });
        expect(result2.current.copied).toBe(false);
    });
});
