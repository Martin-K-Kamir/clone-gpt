import { describe, expect, expectTypeOf, it } from "vitest";

import {
    AuthenticationError,
    SessionInvalidError,
} from "@/features/auth/lib/classes";
import type { Session } from "@/features/auth/lib/types";

import { assertSessionExists } from "./asserts";

describe("assertSessionExists", () => {
    describe("valid sessions", () => {
        it("should not throw for valid session with all fields", () => {
            const validSession = {
                user: {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    name: "John Doe",
                    image: "https://example.com/image.jpg",
                },
            };

            expect(() => assertSessionExists(validSession)).not.toThrow();
        });

        it("should not throw for valid session without image", () => {
            const validSession = {
                user: {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    name: "Jane Doe",
                },
            };

            expect(() => assertSessionExists(validSession)).not.toThrow();
        });

        it("should not throw for valid session with null image", () => {
            const validSession = {
                user: {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    name: "Jane Doe",
                    image: null,
                },
            };

            expect(() => assertSessionExists(validSession)).not.toThrow();
        });

        it("should narrow type to Session after assertion", () => {
            const validSession = {
                user: {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    name: "John Doe",
                    image: "https://example.com/image.jpg",
                },
            };

            assertSessionExists(validSession);

            expectTypeOf(validSession).toMatchTypeOf<Session>();
        });
    });

    describe("null or undefined session", () => {
        it("should throw AuthenticationError for null session", () => {
            expect(() => assertSessionExists(null)).toThrow(
                AuthenticationError,
            );
        });

        it("should throw AuthenticationError for undefined session", () => {
            expect(() => assertSessionExists(undefined)).toThrow(
                AuthenticationError,
            );
        });

        it("should throw AuthenticationError with default message", () => {
            try {
                assertSessionExists(null);
                expect.fail("Should have thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(AuthenticationError);
                if (error instanceof AuthenticationError) {
                    expect(error.message).toBe("User is not authenticated");
                    expect(error.kind).toBe("authentication");
                }
            }
        });
    });

    describe("invalid session data", () => {
        it("should throw SessionInvalidError for missing user field", () => {
            const invalidSession = {};

            expect(() => assertSessionExists(invalidSession)).toThrow(
                SessionInvalidError,
            );
        });

        it("should throw SessionInvalidError for missing user.id", () => {
            const invalidSession = {
                user: {
                    name: "John Doe",
                },
            };

            expect(() => assertSessionExists(invalidSession)).toThrow(
                SessionInvalidError,
            );
        });

        it("should throw SessionInvalidError for missing user.name", () => {
            const invalidSession = {
                user: {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                },
            };

            expect(() => assertSessionExists(invalidSession)).toThrow(
                SessionInvalidError,
            );
        });

        it("should throw SessionInvalidError for invalid UUID in user.id", () => {
            const invalidSession = {
                user: {
                    id: "not-a-uuid",
                    name: "John Doe",
                },
            };

            expect(() => assertSessionExists(invalidSession)).toThrow(
                SessionInvalidError,
            );
        });

        it("should throw SessionInvalidError for wrong type in user.id", () => {
            const invalidSession = {
                user: {
                    id: 123,
                    name: "John Doe",
                },
            };

            expect(() => assertSessionExists(invalidSession)).toThrow(
                SessionInvalidError,
            );
        });

        it("should throw SessionInvalidError for wrong type in user.name", () => {
            const invalidSession = {
                user: {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    name: 123,
                },
            };

            expect(() => assertSessionExists(invalidSession)).toThrow(
                SessionInvalidError,
            );
        });

        it("should throw SessionInvalidError for wrong type in user.image", () => {
            const invalidSession = {
                user: {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    name: "John Doe",
                    image: 123,
                },
            };

            expect(() => assertSessionExists(invalidSession)).toThrow(
                SessionInvalidError,
            );
        });

        it("should throw SessionInvalidError with issues in error", () => {
            const invalidSession = {
                user: {
                    id: "not-a-uuid",
                    name: "John Doe",
                },
            };

            try {
                assertSessionExists(invalidSession);
                expect.fail("Should have thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(SessionInvalidError);
                if (error instanceof SessionInvalidError) {
                    expect(error.issues).toBeDefined();
                    expect(Array.isArray(error.issues)).toBe(true);
                    expect(error.message).toBe("Session is not valid");
                    expect(error.kind).toBe("invalid_session");
                }
            }
        });

        it("should throw SessionInvalidError for completely wrong structure", () => {
            const invalidSession = {
                notUser: "something",
            };

            expect(() => assertSessionExists(invalidSession)).toThrow(
                SessionInvalidError,
            );
        });

        it("should throw SessionInvalidError for array instead of object", () => {
            const invalidSession: unknown = [];

            expect(() => assertSessionExists(invalidSession)).toThrow(
                SessionInvalidError,
            );
        });

        it("should throw SessionInvalidError for string instead of object", () => {
            const invalidSession = "not a session";

            expect(() => assertSessionExists(invalidSession)).toThrow(
                SessionInvalidError,
            );
        });

        it("should throw SessionInvalidError for number instead of object", () => {
            const invalidSession = 123;

            expect(() => assertSessionExists(invalidSession)).toThrow(
                SessionInvalidError,
            );
        });
    });

    describe("error properties", () => {
        it("should include validation issues in SessionInvalidError", () => {
            const invalidSession = {
                user: {
                    id: "invalid",
                    name: 123,
                },
            };

            try {
                assertSessionExists(invalidSession);
                expect.fail("Should have thrown");
            } catch (error) {
                if (error instanceof SessionInvalidError) {
                    expect(error.issues).toBeDefined();
                    expect(Array.isArray(error.issues)).toBe(true);
                    expect(error.issues!.length).toBeGreaterThan(0);
                }
            }
        });

        it("should set error message from issues in SessionInvalidError", () => {
            const invalidSession = {
                user: {
                    id: "invalid",
                },
            };

            try {
                assertSessionExists(invalidSession);
                expect.fail("Should have thrown");
            } catch (error) {
                if (error instanceof SessionInvalidError) {
                    expect(error.error).toBeDefined();
                    expect(typeof error.error).toBe("string");
                }
            }
        });
    });
});
