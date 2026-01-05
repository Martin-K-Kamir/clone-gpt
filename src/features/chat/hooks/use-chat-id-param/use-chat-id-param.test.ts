import { generateChatId } from "@/vitest/helpers/generate-test-ids";
import { renderHook } from "@testing-library/react";
import { usePathname } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useChatIdParam } from "./use-chat-id-param";

vi.mock("next/navigation", () => ({
    usePathname: vi.fn(),
}));

const mockUsePathname = vi.mocked(usePathname);

describe("useChatIdParam", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return chat ID when pathname contains valid UUID", () => {
        const chatId = generateChatId();
        mockUsePathname.mockReturnValue(`/chat/${chatId}`);

        const { result } = renderHook(() => useChatIdParam());

        expect(result.current).toBe(chatId);
    });

    it("should return null when pathname does not contain chat ID", () => {
        mockUsePathname.mockReturnValue("/");

        const { result } = renderHook(() => useChatIdParam());

        expect(result.current).toBeNull();
    });

    it("should return null when pathname contains invalid UUID", () => {
        mockUsePathname.mockReturnValue("/chat/invalid-id");

        const { result } = renderHook(() => useChatIdParam());

        expect(result.current).toBeNull();
    });

    it("should return null when pathname is not a chat path", () => {
        mockUsePathname.mockReturnValue("/settings");

        const { result } = renderHook(() => useChatIdParam());

        expect(result.current).toBeNull();
    });

    it("should return chat ID for different valid UUID formats", () => {
        const chatId1 = generateChatId();
        const chatId2 = generateChatId();

        mockUsePathname.mockReturnValue(`/chat/${chatId1}`);
        const { result: result1 } = renderHook(() => useChatIdParam());
        expect(result1.current).toBe(chatId1);

        mockUsePathname.mockReturnValue(`/chat/${chatId2}`);
        const { result: result2 } = renderHook(() => useChatIdParam());
        expect(result2.current).toBe(chatId2);
    });
});
