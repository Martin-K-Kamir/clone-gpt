import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_CUSTOM_PROVIDER } from "@/features/auth/lib/constants";

import { GET } from "./route";

const mocks = vi.hoisted(() => ({
    getToken: vi.fn(),
    signIn: vi.fn(),
}));

vi.mock("next-auth/jwt", () => ({
    getToken: mocks.getToken,
}));

vi.mock("@/features/auth/services/auth", () => ({
    signIn: mocks.signIn,
}));

describe("GET /api/auth/guest", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should redirect to redirectUrl when token exists", async () => {
        const mockToken = { id: "user-id", email: "test@example.com" };
        mocks.getToken.mockResolvedValue(mockToken);

        const request = new Request(
            "http://localhost/api/auth/guest?redirectUrl=/dashboard",
        );
        const response = await GET(request);

        expect(response).toBeInstanceOf(NextResponse);
        expect(mocks.signIn).not.toHaveBeenCalled();
    });

    it("should redirect to default '/' when token exists and no redirectUrl provided", async () => {
        const mockToken = { id: "user-id", email: "test@example.com" };
        mocks.getToken.mockResolvedValue(mockToken);

        const request = new Request("http://localhost/api/auth/guest");
        const response = await GET(request);

        expect(response).toBeInstanceOf(NextResponse);
        expect(mocks.signIn).not.toHaveBeenCalled();
    });

    it("should call signIn with guest when token does not exist", async () => {
        mocks.getToken.mockResolvedValue(null);
        mocks.signIn.mockResolvedValue(new NextResponse());

        const request = new Request(
            "http://localhost/api/auth/guest?redirectUrl=/dashboard",
        );
        const response = await GET(request);

        expect(mocks.signIn).toHaveBeenCalledWith(AUTH_CUSTOM_PROVIDER.GUEST, {
            redirect: true,
            redirectTo: "/dashboard",
        });
        expect(response).toBeInstanceOf(NextResponse);
    });

    it("should call signIn with default redirectUrl when token does not exist and no redirectUrl provided", async () => {
        mocks.getToken.mockResolvedValue(null);
        mocks.signIn.mockResolvedValue(new NextResponse());

        const request = new Request("http://localhost/api/auth/guest");
        const response = await GET(request);

        expect(mocks.signIn).toHaveBeenCalledWith(AUTH_CUSTOM_PROVIDER.GUEST, {
            redirect: true,
            redirectTo: "/",
        });
        expect(response).toBeInstanceOf(NextResponse);
    });
});
