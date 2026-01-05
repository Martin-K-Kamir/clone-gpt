import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { usePrevious } from "@/hooks";

import {
    ChatOffsetProvider,
    useChatOffsetContext,
} from "./chat-offset-provider";

vi.mock("@/hooks", () => ({
    usePrevious: vi.fn(),
}));

const mockUsePrevious = vi.mocked(usePrevious);

describe("ChatOffsetProvider", () => {
    const createWrapper = ({ children }: { children: React.ReactNode }) => (
        <ChatOffsetProvider>{children}</ChatOffsetProvider>
    );

    beforeEach(() => {
        vi.clearAllMocks();
        mockUsePrevious.mockReturnValue(undefined);
    });

    it("should provide initial offset of 0", () => {
        const { result } = renderHook(() => useChatOffsetContext(), {
            wrapper: createWrapper,
        });

        expect(result.current.clientOffset).toBe(0);
        expect(typeof result.current.incrementOffset).toBe("function");
        expect(typeof result.current.decrementOffset).toBe("function");
        expect(typeof result.current.resetOffset).toBe("function");
        expect(typeof result.current.setOffset).toBe("function");
    });

    it("should increment offset when incrementOffset is called", () => {
        mockUsePrevious.mockReturnValue(0);

        const { result } = renderHook(() => useChatOffsetContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            result.current.incrementOffset();
        });

        expect(result.current.clientOffset).toBe(1);
    });

    it("should decrement offset when decrementOffset is called", () => {
        mockUsePrevious.mockReturnValue(5);

        const { result } = renderHook(() => useChatOffsetContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            result.current.setOffset(5);
        });

        act(() => {
            result.current.decrementOffset();
        });

        expect(result.current.clientOffset).toBe(4);
    });

    it("should reset offset to 0 when resetOffset is called", () => {
        mockUsePrevious.mockReturnValue(10);

        const { result } = renderHook(() => useChatOffsetContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            result.current.setOffset(10);
        });

        expect(result.current.clientOffset).toBe(10);

        act(() => {
            result.current.resetOffset();
        });

        expect(result.current.clientOffset).toBe(0);
    });

    it("should set offset to specific value when setOffset is called", () => {
        mockUsePrevious.mockReturnValue(0);

        const { result } = renderHook(() => useChatOffsetContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            result.current.setOffset(42);
        });

        expect(result.current.clientOffset).toBe(42);
    });

    it("should return previous offset value", () => {
        mockUsePrevious.mockReturnValue(5);

        const { result } = renderHook(() => useChatOffsetContext(), {
            wrapper: createWrapper,
        });

        expect(result.current.prevClientOffset).toBe(5);
    });

    it("should handle multiple offset changes", () => {
        mockUsePrevious.mockReturnValue(0);

        const { result } = renderHook(() => useChatOffsetContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            result.current.incrementOffset();
        });
        expect(result.current.clientOffset).toBe(1);

        act(() => {
            result.current.incrementOffset();
        });
        expect(result.current.clientOffset).toBe(2);

        act(() => {
            result.current.decrementOffset();
        });
        expect(result.current.clientOffset).toBe(1);

        act(() => {
            result.current.setOffset(100);
        });
        expect(result.current.clientOffset).toBe(100);

        act(() => {
            result.current.resetOffset();
        });
        expect(result.current.clientOffset).toBe(0);
    });
});

describe("useChatOffsetContext", () => {
    it("should throw error when used outside provider", () => {
        expect(() => {
            renderHook(() => useChatOffsetContext());
        }).toThrow(
            "useChatOffsetContext must be used within a ChatOffsetProvider",
        );
    });
});
