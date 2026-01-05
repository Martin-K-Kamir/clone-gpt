import { act, renderHook } from "@testing-library/react";
import { createRef } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    ChatSidebarProvider,
    useChatSidebarContext,
} from "./chat-sidebar-provider";

describe("ChatSidebarProvider", () => {
    const createWrapper = ({ children }: { children: React.ReactNode }) => (
        <ChatSidebarProvider>{children}</ChatSidebarProvider>
    );

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should provide scrollHistoryToTop and setChatHistoryRef functions", () => {
        const { result } = renderHook(() => useChatSidebarContext(), {
            wrapper: createWrapper,
        });

        expect(typeof result.current.scrollHistoryToTop).toBe("function");
        expect(typeof result.current.setChatHistoryRef).toBe("function");
    });

    it("should scroll to top when scrollHistoryToTop is called with valid ref", () => {
        const scrollToSpy = vi.fn();
        const element = document.createElement("div");
        element.scrollTo = scrollToSpy;
        const ref = createRef<HTMLDivElement>();
        ref.current = element;

        const { result } = renderHook(() => useChatSidebarContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            result.current.setChatHistoryRef(ref);
        });

        act(() => {
            result.current.scrollHistoryToTop();
        });

        expect(scrollToSpy).toHaveBeenCalledWith({
            top: 0,
            behavior: "smooth",
        });
    });

    it("should not scroll when scrollHistoryToTop is called without ref", () => {
        const { result } = renderHook(() => useChatSidebarContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            result.current.scrollHistoryToTop();
        });

        expect(result.current.scrollHistoryToTop).toBeDefined();
    });

    it("should not scroll when scrollHistoryToTop is called with null ref", () => {
        const scrollToSpy = vi.fn();
        const ref = createRef<HTMLDivElement>();
        ref.current = null;

        const { result } = renderHook(() => useChatSidebarContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            result.current.setChatHistoryRef(ref);
        });

        act(() => {
            result.current.scrollHistoryToTop();
        });

        expect(scrollToSpy).not.toHaveBeenCalled();
    });

    it("should update ref when setChatHistoryRef is called", () => {
        const scrollToSpy = vi.fn();
        const element1 = document.createElement("div");
        element1.scrollTo = scrollToSpy;
        const ref1 = createRef<HTMLDivElement>();
        ref1.current = element1;

        const element2 = document.createElement("div");
        element2.scrollTo = scrollToSpy;
        const ref2 = createRef<HTMLDivElement>();
        ref2.current = element2;

        const { result } = renderHook(() => useChatSidebarContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            result.current.setChatHistoryRef(ref1);
        });

        act(() => {
            result.current.scrollHistoryToTop();
        });

        expect(scrollToSpy).toHaveBeenCalledTimes(1);

        act(() => {
            result.current.setChatHistoryRef(ref2);
        });

        act(() => {
            result.current.scrollHistoryToTop();
        });

        expect(scrollToSpy).toHaveBeenCalledTimes(2);
    });
});

describe("useChatSidebarContext", () => {
    it("should throw error when used outside provider", () => {
        expect(() => {
            renderHook(() => useChatSidebarContext());
        }).toThrow(
            "useChatSidebarContext must be used within a ChatSidebarProvider.",
        );
    });
});
