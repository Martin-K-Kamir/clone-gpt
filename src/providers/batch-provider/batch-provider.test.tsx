import { act, renderHook, waitFor } from "@testing-library/react";
import { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BatchProvider, useBatch } from "./batch-provider";

describe("BatchProvider", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    const createWrapper =
        <TData, TResult, TError = unknown>({
            operation,
            debounceMs = 500,
            onSuccess,
            onError,
        }: {
            operation: (data: TData[]) => Promise<TResult>;
            debounceMs?: number;
            onSuccess?: (result: TResult) => void;
            onError?: (error: TError) => void;
        }) =>
        ({ children }: { children: ReactNode }) => (
            <BatchProvider
                operation={operation}
                debounceMs={debounceMs}
                onSuccess={onSuccess}
                onError={onError}
            >
                {children}
            </BatchProvider>
        );

    it("should provide all batch methods and state", () => {
        const mockOperation = vi.fn().mockResolvedValue("result");

        const { result } = renderHook(() => useBatch<string>(), {
            wrapper: createWrapper({
                operation: mockOperation,
            }),
        });

        expect(typeof result.current.addToBatch).toBe("function");
        expect(typeof result.current.removeFromBatch).toBe("function");
        expect(typeof result.current.clearBatch).toBe("function");
        expect(typeof result.current.getBatchSize).toBe("function");
        expect(typeof result.current.executeBatch).toBe("function");
        expect(typeof result.current.isExecuting).toBe("boolean");
    });

    it("should throw error when useBatch is used outside provider", () => {
        expect(() => {
            renderHook(() => useBatch<string>());
        }).toThrow("useBatch must be used within a BatchProvider");
    });

    it("should add items to batch", () => {
        const mockOperation = vi.fn().mockResolvedValue("result");

        const { result } = renderHook(() => useBatch<string>(), {
            wrapper: createWrapper({
                operation: mockOperation,
            }),
        });

        act(() => {
            result.current.addToBatch("item1");
        });

        expect(result.current.getBatchSize()).toBe(1);

        act(() => {
            result.current.addToBatch("item2");
        });

        expect(result.current.getBatchSize()).toBe(2);
    });

    it("should not add duplicate items", () => {
        const mockOperation = vi.fn().mockResolvedValue("result");

        const { result } = renderHook(() => useBatch<string>(), {
            wrapper: createWrapper({
                operation: mockOperation,
            }),
        });

        act(() => {
            result.current.addToBatch("item1");
            result.current.addToBatch("item1");
        });

        expect(result.current.getBatchSize()).toBe(1);
    });

    it("should remove items from batch", () => {
        const mockOperation = vi.fn().mockResolvedValue("result");

        const { result } = renderHook(() => useBatch<string>(), {
            wrapper: createWrapper({
                operation: mockOperation,
            }),
        });

        act(() => {
            result.current.addToBatch("item1");
            result.current.addToBatch("item2");
        });

        expect(result.current.getBatchSize()).toBe(2);

        act(() => {
            result.current.removeFromBatch("item1");
        });

        expect(result.current.getBatchSize()).toBe(1);
    });

    it("should clear all items from batch", () => {
        const mockOperation = vi.fn().mockResolvedValue("result");

        const { result } = renderHook(() => useBatch<string>(), {
            wrapper: createWrapper({
                operation: mockOperation,
            }),
        });

        act(() => {
            result.current.addToBatch("item1");
            result.current.addToBatch("item2");
            result.current.addToBatch("item3");
        });

        expect(result.current.getBatchSize()).toBe(3);

        act(() => {
            result.current.clearBatch();
        });

        expect(result.current.getBatchSize()).toBe(0);
    });

    it("should execute batch after debounce delay", async () => {
        const mockOperation = vi.fn().mockResolvedValue("result");

        const { result } = renderHook(() => useBatch<string>(), {
            wrapper: createWrapper({
                operation: mockOperation,
                debounceMs: 500,
            }),
        });

        act(() => {
            result.current.addToBatch("item1");
        });

        expect(mockOperation).not.toHaveBeenCalled();

        await act(async () => {
            vi.advanceTimersByTime(500);
            await vi.runAllTimersAsync();
        });

        expect(mockOperation).toHaveBeenCalledTimes(1);
        expect(mockOperation).toHaveBeenCalledWith(["item1"]);
    });

    it("should debounce batch execution", async () => {
        const mockOperation = vi.fn().mockResolvedValue("result");

        const { result } = renderHook(() => useBatch<string>(), {
            wrapper: createWrapper({
                operation: mockOperation,
                debounceMs: 500,
            }),
        });

        act(() => {
            result.current.addToBatch("item1");
        });

        await act(async () => {
            vi.advanceTimersByTime(300);
        });

        act(() => {
            result.current.addToBatch("item2");
        });

        await act(async () => {
            vi.advanceTimersByTime(500);
            await vi.runAllTimersAsync();
        });

        expect(mockOperation).toHaveBeenCalledTimes(1);
        expect(mockOperation).toHaveBeenCalledWith(["item1", "item2"]);
    });

    it("should call onSuccess when operation succeeds", async () => {
        const mockOperation = vi.fn().mockResolvedValue("success-result");
        const onSuccess = vi.fn();

        const { result } = renderHook(() => useBatch<string>(), {
            wrapper: createWrapper({
                operation: mockOperation,
                onSuccess,
                debounceMs: 100,
            }),
        });

        act(() => {
            result.current.addToBatch("item1");
        });

        await act(async () => {
            vi.advanceTimersByTime(100);
            await vi.runAllTimersAsync();
        });

        expect(onSuccess).toHaveBeenCalledWith("success-result");
    });

    it("should call onError when operation fails", async () => {
        const error = new Error("operation failed");
        const mockOperation = vi.fn().mockRejectedValue(error);
        const onError = vi.fn();

        const { result } = renderHook(() => useBatch<string>(), {
            wrapper: createWrapper({
                operation: mockOperation,
                onError,
                debounceMs: 100,
            }),
        });

        act(() => {
            result.current.addToBatch("item1");
        });

        await act(async () => {
            vi.advanceTimersByTime(100);
            await vi.runAllTimersAsync();
        });

        expect(onError).toHaveBeenCalledWith(error);
    });

    it("should clear batch after successful execution", async () => {
        const mockOperation = vi.fn().mockResolvedValue("result");

        const { result } = renderHook(() => useBatch<string>(), {
            wrapper: createWrapper({
                operation: mockOperation,
                debounceMs: 100,
            }),
        });

        act(() => {
            result.current.addToBatch("item1");
        });

        expect(result.current.getBatchSize()).toBe(1);

        await act(async () => {
            vi.advanceTimersByTime(100);
            await vi.runAllTimersAsync();
        });

        expect(result.current.getBatchSize()).toBe(0);
    });

    it("should not execute when batch is empty", async () => {
        const mockOperation = vi.fn().mockResolvedValue("result");

        const { result } = renderHook(() => useBatch<string>(), {
            wrapper: createWrapper({
                operation: mockOperation,
                debounceMs: 100,
            }),
        });

        await act(async () => {
            await result.current.executeBatch();
        });

        expect(mockOperation).not.toHaveBeenCalled();
    });

    it("should manually execute batch", async () => {
        const mockOperation = vi.fn().mockResolvedValue("result");

        const { result } = renderHook(() => useBatch<string>(), {
            wrapper: createWrapper({
                operation: mockOperation,
            }),
        });

        act(() => {
            result.current.addToBatch("item1");
            result.current.addToBatch("item2");
        });

        await act(async () => {
            await result.current.executeBatch();
        });

        expect(mockOperation).toHaveBeenCalledTimes(1);
        expect(mockOperation).toHaveBeenCalledWith(["item1", "item2"]);
    });

    it("should not execute when already executing", async () => {
        let resolveOperation: (value: string) => void;
        const mockOperation = vi.fn().mockImplementation(
            () =>
                new Promise<string>(resolve => {
                    resolveOperation = resolve;
                }),
        );

        const { result } = renderHook(() => useBatch<string>(), {
            wrapper: createWrapper({
                operation: mockOperation,
            }),
        });

        act(() => {
            result.current.addToBatch("item1");
        });

        const executePromise = act(async () => {
            return result.current.executeBatch();
        });

        await act(async () => {
            await result.current.executeBatch();
        });

        act(() => {
            resolveOperation!("result");
        });

        await executePromise;

        expect(mockOperation).toHaveBeenCalledTimes(1);
    });

    it("should clear timeout when batch is cleared", async () => {
        const mockOperation = vi.fn().mockResolvedValue("result");

        const { result } = renderHook(() => useBatch<string>(), {
            wrapper: createWrapper({
                operation: mockOperation,
                debounceMs: 500,
            }),
        });

        act(() => {
            result.current.addToBatch("item1");
        });

        await act(async () => {
            vi.advanceTimersByTime(200);
        });

        act(() => {
            result.current.clearBatch();
        });

        await act(async () => {
            vi.advanceTimersByTime(500);
        });

        expect(mockOperation).not.toHaveBeenCalled();
    });

    it("should clean up timeout on unmount", async () => {
        const mockOperation = vi.fn().mockResolvedValue("result");

        const { result, unmount } = renderHook(() => useBatch<string>(), {
            wrapper: createWrapper({
                operation: mockOperation,
                debounceMs: 500,
            }),
        });

        act(() => {
            result.current.addToBatch("item1");
        });

        unmount();

        await act(async () => {
            vi.advanceTimersByTime(500);
        });

        expect(mockOperation).not.toHaveBeenCalled();
    });

    it("should handle custom data types", () => {
        type CustomData = { id: number; name: string };
        const mockOperation = vi
            .fn()
            .mockResolvedValue({ success: true } as const);

        const { result } = renderHook(() => useBatch<CustomData>(), {
            wrapper: createWrapper({
                operation: mockOperation,
            }),
        });

        const item1: CustomData = { id: 1, name: "Item 1" };
        const item2: CustomData = { id: 2, name: "Item 2" };

        act(() => {
            result.current.addToBatch(item1);
            result.current.addToBatch(item2);
        });

        expect(result.current.getBatchSize()).toBe(2);
    });
});
