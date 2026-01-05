import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useNativeShare } from "./use-native-share";

describe("useNativeShare", () => {
    const mockShare = vi.fn();
    const mockOnShare = vi.fn(() => ({
        title: "Test Title",
        text: "Test Text",
        url: "https://test.com",
    }));
    const mockOnSuccess = vi.fn();
    const mockOnError = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        Object.defineProperty(global, "navigator", {
            value: {
                share: mockShare,
            },
            writable: true,
            configurable: true,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should detect if native share is available", () => {
        const { result } = renderHook(() =>
            useNativeShare({
                onShare: mockOnShare,
            }),
        );

        expect(result.current.canShare).toBe(true);
    });

    it("should detect if native share is not available", () => {
        Object.defineProperty(global, "navigator", {
            value: {},
            writable: true,
            configurable: true,
        });

        const { result } = renderHook(() =>
            useNativeShare({
                onShare: mockOnShare,
            }),
        );

        expect(result.current.canShare).toBe(false);
    });

    it("should return false and not call onShare when share is not available", async () => {
        Object.defineProperty(global, "navigator", {
            value: {},
            writable: true,
            configurable: true,
        });

        const { result } = renderHook(() =>
            useNativeShare({
                onShare: mockOnShare,
            }),
        );

        const shareResult = await result.current.share();

        expect(shareResult).toBe(false);
        expect(mockOnShare).not.toHaveBeenCalled();
    });

    it("should call onSuccess and return true when share succeeds", async () => {
        mockShare.mockResolvedValue(undefined);

        const { result } = renderHook(() =>
            useNativeShare({
                onShare: mockOnShare,
                onSuccess: mockOnSuccess,
            }),
        );

        const shareResult = await result.current.share();

        expect(shareResult).toBe(true);
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });

    it("should not call onError when AbortError occurs", async () => {
        const abortError = new Error("User aborted");
        abortError.name = "AbortError";
        mockShare.mockRejectedValue(abortError);

        const { result } = renderHook(() =>
            useNativeShare({
                onShare: mockOnShare,
                onError: mockOnError,
            }),
        );

        const shareResult = await result.current.share();

        expect(shareResult).toBe(false);
        expect(mockOnError).not.toHaveBeenCalled();
    });

    it("should call onError and return false when share fails", async () => {
        const error = new Error("Share failed");
        mockShare.mockRejectedValue(error);

        const { result } = renderHook(() =>
            useNativeShare({
                onShare: mockOnShare,
                onError: mockOnError,
            }),
        );

        const shareResult = await result.current.share();

        expect(shareResult).toBe(false);
        expect(mockOnError).toHaveBeenCalledWith(error);
    });

    it("should handle share data with partial or empty fields", async () => {
        mockShare.mockResolvedValue(undefined);

        const partialOnShare = vi.fn(() => ({ title: "Only Title" }));
        const { result: result1 } = renderHook(() =>
            useNativeShare({ onShare: partialOnShare }),
        );
        expect(await result1.current.share()).toBe(true);

        const emptyOnShare = vi.fn(() => ({}));
        const { result: result2 } = renderHook(() =>
            useNativeShare({ onShare: emptyOnShare }),
        );
        expect(await result2.current.share()).toBe(true);
    });

    it("should handle SSR when navigator is undefined", () => {
        Object.defineProperty(global, "navigator", {
            value: undefined,
            writable: true,
            configurable: true,
        });

        const { result } = renderHook(() =>
            useNativeShare({
                onShare: mockOnShare,
            }),
        );

        expect(result.current.canShare).toBe(false);
    });
});
