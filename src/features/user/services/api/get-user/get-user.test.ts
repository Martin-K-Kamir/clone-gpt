import { generateUserId } from "@/vitest/helpers/generate-test-ids";
import { server } from "@/vitest/unit-setup";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
import type { DBUser } from "@/features/user/lib/types";

import { ApiError } from "@/lib/classes";

import { getUser } from "./get-user";

describe("getUser", () => {
    it("should return user data when API returns success", async () => {
        const userId = generateUserId();
        const mockUser: DBUser = {
            id: userId,
            email: "user@example.com",
            name: "John Doe",
            image: "https://example.com/avatar.jpg",
            role: USER_ROLE.USER,
            createdAt: "2024-01-01T00:00:00Z",
            password: null,
        };

        const mockResponse = {
            success: true,
            data: mockUser,
            message: "Successfully retrieved user data",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user", () => {
                return HttpResponse.json(mockResponse);
            }),
        );

        const result = await getUser();

        expect(result).toEqual(mockUser);
        expect(result.id).toBe(userId);
        expect(result.email).toBe("user@example.com");
        expect(result.name).toBe("John Doe");
        expect(result.role).toBe(USER_ROLE.USER);
    });

    it("should return user data with null image", async () => {
        const userId = generateUserId();
        const mockUser: DBUser = {
            id: userId,
            email: "test@example.com",
            name: "Jane Smith",
            image: null,
            role: USER_ROLE.ADMIN,
            createdAt: "2024-01-01T00:00:00Z",
            password: null,
        };

        const mockResponse = {
            success: true,
            data: mockUser,
            message: "Successfully retrieved user data",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user", () => {
                return HttpResponse.json(mockResponse);
            }),
        );

        const result = await getUser();

        expect(result).toEqual(mockUser);
        expect(result.image).toBeNull();
        expect(result.role).toBe(USER_ROLE.ADMIN);
    });

    it("should return user data with guest role", async () => {
        const userId = generateUserId();
        const mockUser: DBUser = {
            id: userId,
            email: "guest@example.com",
            name: "Guest User",
            image: null,
            role: USER_ROLE.GUEST,
            createdAt: "2024-01-01T00:00:00Z",
            password: null,
        };

        const mockResponse = {
            success: true,
            data: mockUser,
            message: "Successfully retrieved user data",
            status: 200,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user", () => {
                return HttpResponse.json(mockResponse);
            }),
        );

        const result = await getUser();

        expect(result).toEqual(mockUser);
        expect(result.role).toBe(USER_ROLE.GUEST);
    });

    it("should throw ApiError when API returns error response (not ok)", async () => {
        server.use(
            http.get("http://localhost/api/user", () => {
                return HttpResponse.json(
                    { error: "Unauthorized" },
                    { status: 401 },
                );
            }),
        );

        await expect(getUser()).rejects.toThrow(ApiError);
        await expect(getUser()).rejects.toThrow("Failed to fetch user");
    });

    it("should throw ApiError with correct status code when API returns error", async () => {
        server.use(
            http.get("http://localhost/api/user", () => {
                return HttpResponse.json(
                    { error: "Forbidden" },
                    { status: 403 },
                );
            }),
        );

        try {
            await getUser();
            expect.fail("Should have thrown ApiError");
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError);
            if (error instanceof ApiError) {
                expect(error.status).toBe(403);
            }
        }
    });

    it("should throw ApiError when API response has success: false", async () => {
        const mockErrorResponse = {
            success: false,
            message: "User not found",
            status: 404,
            timestamp: Date.now(),
        };

        server.use(
            http.get("http://localhost/api/user", () => {
                return HttpResponse.json(mockErrorResponse, { status: 200 });
            }),
        );

        await expect(getUser()).rejects.toThrow(ApiError);
        await expect(getUser()).rejects.toThrow("User not found");

        try {
            await getUser();
            expect.fail("Should have thrown ApiError");
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError);
            if (error instanceof ApiError) {
                expect(error.status).toBe(404);
            }
        }
    });

    it("should throw error on network failure", async () => {
        server.use(
            http.get("http://localhost/api/user", () => {
                return HttpResponse.error();
            }),
        );

        await expect(getUser()).rejects.toThrow();
    });

    it("should throw ApiError when API returns server error", async () => {
        server.use(
            http.get("http://localhost/api/user", () => {
                return HttpResponse.json(
                    { error: "Internal server error" },
                    { status: 500 },
                );
            }),
        );

        await expect(getUser()).rejects.toThrow(ApiError);
        await expect(getUser()).rejects.toThrow("Failed to fetch user");

        try {
            await getUser();
            expect.fail("Should have thrown ApiError");
        } catch (error) {
            expect(error).toBeInstanceOf(ApiError);
            if (error instanceof ApiError) {
                expect(error.status).toBe(500);
            }
        }
    });
});
