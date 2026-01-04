import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useSocialShare } from "./use-social-share";

describe("useSocialShare", () => {
    let mockWindowOpen: ReturnType<typeof vi.fn>;
    let mockFocus: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockFocus = vi.fn();
        mockWindowOpen = vi.fn(() => ({
            focus: mockFocus,
        }));
        global.window.open = mockWindowOpen as typeof window.open;
        vi.clearAllMocks();
    });

    it("returns getShareUrl and openSharePopup functions", () => {
        const { result } = renderHook(() => useSocialShare());

        expect(typeof result.current.getShareUrl).toBe("function");
        expect(typeof result.current.openSharePopup).toBe("function");
    });

    it("generates share URLs for different platforms", () => {
        const { result } = renderHook(() => useSocialShare());

        const linkedinUrl = result.current.getShareUrl("linkedin", {
            url: "https://example.com",
            text: "Check this out",
        });
        expect(linkedinUrl).toContain("linkedin.com/feed/");
        expect(linkedinUrl).toContain("shareUrl=https%3A%2F%2Fexample.com");

        const twitterUrl = result.current.getShareUrl("twitter", {
            url: "https://example.com",
            text: "Amazing content",
        });
        expect(twitterUrl).toContain("twitter.com/intent/tweet");
        expect(twitterUrl).toContain("url=https%3A%2F%2Fexample.com");

        const redditUrl = result.current.getShareUrl("reddit", {
            url: "https://example.com",
            text: "Interesting post",
        });
        expect(redditUrl).toContain("reddit.com/submit");
        expect(redditUrl).toContain("url=https%3A%2F%2Fexample.com");
    });

    it("opens popup with default options", () => {
        const { result } = renderHook(() => useSocialShare());

        result.current.openSharePopup("twitter", {
            url: "https://example.com",
            text: "Test",
        });

        expect(mockWindowOpen).toHaveBeenCalledTimes(1);
        expect(mockWindowOpen).toHaveBeenCalledWith(
            expect.stringContaining("twitter.com"),
            "share-twitter",
            expect.stringContaining("width=600"),
        );
        expect(mockFocus).toHaveBeenCalled();
    });

    it("opens popup with custom options", () => {
        const { result } = renderHook(() => useSocialShare());

        result.current.openSharePopup(
            "linkedin",
            {
                url: "https://example.com",
                text: "Test",
            },
            {
                width: 800,
                height: 600,
            },
        );

        expect(mockWindowOpen).toHaveBeenCalledWith(
            expect.stringContaining("linkedin.com"),
            "share-linkedin",
            expect.stringContaining("width=800"),
        );
    });

    it("merges custom options with defaults", () => {
        const { result } = renderHook(() => useSocialShare());

        result.current.openSharePopup(
            "reddit",
            {
                url: "https://example.com",
                text: "Test",
            },
            {
                width: 1000,
            },
        );

        expect(mockWindowOpen).toHaveBeenCalledWith(
            expect.any(String),
            "share-reddit",
            expect.stringContaining("width=1000"),
        );
    });

    it("handles popup blocked scenario", () => {
        mockWindowOpen.mockReturnValue(null);
        const { result } = renderHook(() => useSocialShare());

        result.current.openSharePopup("twitter", {
            url: "https://example.com",
            text: "Test",
        });

        expect(mockWindowOpen).toHaveBeenCalled();
        expect(mockFocus).not.toHaveBeenCalled();
    });

    it("handles special characters in share data", () => {
        const { result } = renderHook(() => useSocialShare());

        const url = result.current.getShareUrl("twitter", {
            url: "https://example.com?query=test&value=123",
            text: "Hello & Goodbye",
        });

        expect(url).toContain("example.com%3Fquery%3Dtest%26value%3D123");
        expect(url).toContain("Hello+%26+Goodbye");
    });
});
