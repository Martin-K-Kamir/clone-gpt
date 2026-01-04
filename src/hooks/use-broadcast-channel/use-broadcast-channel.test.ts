import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useBroadcastChannel } from "./use-broadcast-channel";

describe("useBroadcastChannel", () => {
    let mockBroadcastChannel: {
        postMessage: ReturnType<typeof vi.fn>;
        close: ReturnType<typeof vi.fn>;
        onmessage: ((event: MessageEvent) => void) | null;
    };
    let MockBroadcastChannel: new (name: string) => typeof mockBroadcastChannel;

    beforeEach(() => {
        mockBroadcastChannel = {
            postMessage: vi.fn(),
            close: vi.fn(),
            onmessage: null,
        };

        MockBroadcastChannel = vi.fn(function (
            this: typeof mockBroadcastChannel,
        ) {
            return mockBroadcastChannel;
        }) as unknown as new (name: string) => typeof mockBroadcastChannel;

        global.BroadcastChannel =
            MockBroadcastChannel as unknown as typeof BroadcastChannel;
    });

    afterEach(() => {
        vi.clearAllMocks();
        delete (global as { BroadcastChannel?: typeof BroadcastChannel })
            .BroadcastChannel;
    });

    it("creates a BroadcastChannel on mount", () => {
        renderHook(() =>
            useBroadcastChannel({
                channelName: "test-channel",
            }),
        );

        expect(MockBroadcastChannel).toHaveBeenCalledWith("test-channel");
    });

    it("returns postMessage function and isConnected state", () => {
        const { result } = renderHook(() =>
            useBroadcastChannel({
                channelName: "test-channel",
            }),
        );

        expect(typeof result.current.postMessage).toBe("function");
        expect(typeof result.current.isConnected).toBe("boolean");
        expect(MockBroadcastChannel).toHaveBeenCalled();
    });

    it("posts message when postMessage is called", () => {
        const { result } = renderHook(() =>
            useBroadcastChannel({
                channelName: "test-channel",
            }),
        );

        const message = { type: "test", data: "hello" };
        result.current.postMessage(message);

        expect(mockBroadcastChannel.postMessage).toHaveBeenCalledWith(message);
    });

    it("calls onMessage callback when message is received", async () => {
        const onMessage = vi.fn();

        renderHook(() =>
            useBroadcastChannel({
                channelName: "test-channel",
                onMessage,
            }),
        );

        await waitFor(() => {
            expect(mockBroadcastChannel.onmessage).not.toBeNull();
        });

        const message = { type: "test", data: "hello" };
        const event = { data: message } as MessageEvent;

        act(() => {
            if (mockBroadcastChannel.onmessage) {
                mockBroadcastChannel.onmessage(event);
            }
        });

        expect(onMessage).toHaveBeenCalledWith(message);
    });

    it("does not call onMessage if callback is not provided", async () => {
        const onMessage = vi.fn();

        renderHook(() =>
            useBroadcastChannel({
                channelName: "test-channel",
            }),
        );

        await waitFor(() => {
            expect(mockBroadcastChannel.onmessage).not.toBeNull();
        });

        const event = { data: { type: "test" } } as MessageEvent;

        act(() => {
            if (mockBroadcastChannel.onmessage) {
                mockBroadcastChannel.onmessage(event);
            }
        });

        expect(onMessage).not.toHaveBeenCalled();
    });

    it("closes BroadcastChannel on unmount", async () => {
        const { unmount } = renderHook(() =>
            useBroadcastChannel({
                channelName: "test-channel",
            }),
        );

        await waitFor(() => {
            expect(mockBroadcastChannel.onmessage).not.toBeNull();
        });

        unmount();

        expect(mockBroadcastChannel.close).toHaveBeenCalled();
    });

    it("does not create BroadcastChannel when enabled is false", () => {
        renderHook(() =>
            useBroadcastChannel({
                channelName: "test-channel",
                enabled: false,
            }),
        );

        expect(MockBroadcastChannel).not.toHaveBeenCalled();
    });

    it("returns isConnected false when enabled is false", () => {
        const { result } = renderHook(() =>
            useBroadcastChannel({
                channelName: "test-channel",
                enabled: false,
            }),
        );

        expect(result.current.isConnected).toBe(false);
    });

    it("does not post message when enabled is false", () => {
        const { result } = renderHook(() =>
            useBroadcastChannel({
                channelName: "test-channel",
                enabled: false,
            }),
        );

        result.current.postMessage({ type: "test" });

        expect(mockBroadcastChannel.postMessage).not.toHaveBeenCalled();
    });

    it("handles multiple messages correctly", async () => {
        const onMessage = vi.fn();

        renderHook(() =>
            useBroadcastChannel({
                channelName: "test-channel",
                onMessage,
            }),
        );

        await waitFor(() => {
            expect(mockBroadcastChannel.onmessage).not.toBeNull();
        });

        const message1 = { type: "test1" };
        const message2 = { type: "test2" };

        act(() => {
            if (mockBroadcastChannel.onmessage) {
                mockBroadcastChannel.onmessage({
                    data: message1,
                } as MessageEvent);
                mockBroadcastChannel.onmessage({
                    data: message2,
                } as MessageEvent);
            }
        });

        expect(onMessage).toHaveBeenCalledTimes(2);
        expect(onMessage).toHaveBeenNthCalledWith(1, message1);
        expect(onMessage).toHaveBeenNthCalledWith(2, message2);
    });

    it("recreates BroadcastChannel when channelName changes", async () => {
        const { rerender } = renderHook(
            ({ channelName }) =>
                useBroadcastChannel({
                    channelName,
                }),
            {
                initialProps: { channelName: "channel-1" },
            },
        );

        await waitFor(() => {
            expect(MockBroadcastChannel).toHaveBeenCalledWith("channel-1");
        });

        rerender({ channelName: "channel-2" });

        await waitFor(() => {
            expect(mockBroadcastChannel.close).toHaveBeenCalled();
            expect(MockBroadcastChannel).toHaveBeenCalledWith("channel-2");
        });
    });

    it("handles errors when creating BroadcastChannel", () => {
        const consoleErrorSpy = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});

        MockBroadcastChannel = vi.fn(() => {
            throw new Error("BroadcastChannel not supported");
        }) as unknown as new (name: string) => typeof mockBroadcastChannel;

        global.BroadcastChannel =
            MockBroadcastChannel as unknown as typeof BroadcastChannel;

        const { result } = renderHook(() =>
            useBroadcastChannel({
                channelName: "test-channel",
            }),
        );

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            "Failed to create BroadcastChannel:",
            expect.any(Error),
        );
        expect(result.current.isConnected).toBe(false);

        consoleErrorSpy.mockRestore();
    });
});
