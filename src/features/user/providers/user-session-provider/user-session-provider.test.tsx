import { act, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import type { UIUser } from "@/features/user/lib/types";

import {
    UserSessionProvider,
    useUserSessionContext,
} from "./user-session-provider";

describe("UserSessionProvider", () => {
    const createWrapper = ({ children }: { children: ReactNode }) => (
        <UserSessionProvider>{children}</UserSessionProvider>
    );

    it("provides initial user as null", () => {
        const { result } = renderHook(() => useUserSessionContext(), {
            wrapper: createWrapper,
        });

        expect(result.current.user).toBeNull();
        expect(typeof result.current.setUser).toBe("function");
    });

    it("updates user when setUser is called", () => {
        const mockUser: UIUser = {
            id: "user-1",
            email: "test@example.com",
        } as UIUser;

        const { result } = renderHook(() => useUserSessionContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            result.current.setUser(mockUser);
        });

        expect(result.current.user).toBe(mockUser);
    });

    it("clears user when setUser is called with null", () => {
        const mockUser: UIUser = {
            id: "user-1",
            email: "test@example.com",
        } as UIUser;

        const { result } = renderHook(() => useUserSessionContext(), {
            wrapper: createWrapper,
        });

        act(() => {
            result.current.setUser(mockUser);
        });

        expect(result.current.user).toBe(mockUser);

        act(() => {
            result.current.setUser(null);
        });

        expect(result.current.user).toBeNull();
    });

    it("throws error when useUserSessionContext is used outside provider", () => {
        expect(() => {
            renderHook(() => useUserSessionContext());
        }).toThrow(
            "useUserSessionContext must be used within a UserSessionProvider",
        );
    });
});
