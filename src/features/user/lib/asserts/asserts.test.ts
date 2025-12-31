import { describe, expect, expectTypeOf, it } from "vitest";

import { AI_PERSONALITIES } from "@/features/chat/lib/constants";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
import type {
    DBUserChatPreferences,
    DBUserId,
    DBUserRole,
    NewUser,
} from "@/features/user/lib/types";

import { AssertError } from "@/lib/classes";

import {
    assertIsDBUserId,
    assertIsNewUser,
    assertIsUserChatPreferences,
    assertIsUserRole,
} from "./asserts";

describe("assertIsDBUserId", () => {
    describe("valid UUIDs", () => {
        it("should not throw for valid UUID strings", () => {
            const validUUIDs = [
                "550e8400-e29b-41d4-a716-446655440000",
                "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                "00000000-0000-0000-0000-000000000000",
                "ffffffff-ffff-ffff-ffff-ffffffffffff",
            ];

            validUUIDs.forEach(uuid => {
                expect(() => assertIsDBUserId(uuid)).not.toThrow();
            });
        });
    });

    describe("invalid UUIDs", () => {
        it("should throw AssertError for invalid UUID strings", () => {
            const invalidUUIDs = [
                "not-a-uuid",
                "550e8400-e29b-41d4-a716", // Too short
                "550e8400-e29b-41d4-a716-446655440000-extra", // Too long
                "550e8400e29b41d4a716446655440000", // No dashes
                "",
                "550e8400-e29b-41d4-a716-44665544g000", // Invalid character
                null,
                undefined,
                123,
                {},
                [],
            ];

            invalidUUIDs.forEach(uuid => {
                expect(() => assertIsDBUserId(uuid)).toThrow(AssertError);
            });
        });
    });

    describe("error handling", () => {
        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsDBUserId("invalid");
            }).toThrow("Invalid userId");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom userId validation error";
            expect(() => {
                assertIsDBUserId("invalid", customMessage);
            }).toThrow(customMessage);
        });

        it("should throw AssertError with issues", () => {
            try {
                assertIsDBUserId("invalid");
                expect.fail("Should have thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(AssertError);
                expect((error as AssertError).issues).toBeDefined();
                expect((error as AssertError).issues?.length).toBeGreaterThan(
                    0,
                );
            }
        });
    });

    describe("type narrowing", () => {
        it("should narrow type correctly", () => {
            const value: unknown = "550e8400-e29b-41d4-a716-446655440000";
            assertIsDBUserId(value);
            expectTypeOf(value).toEqualTypeOf<DBUserId>();
        });
    });
});

describe("assertIsNewUser", () => {
    describe("valid NewUser objects", () => {
        it("should not throw for valid NewUser with email and name", () => {
            const validUsers = [
                { email: "test@example.com", name: "John Doe" },
                { email: "user@domain.co.uk", name: "A" }, // Minimum name length
                { email: "test+tag@example.com", name: "Jane Smith" },
                {
                    email: "user.name@example-domain.com",
                    name: "Very Long Name That Is Still Valid",
                },
            ];

            validUsers.forEach(user => {
                expect(() => assertIsNewUser(user)).not.toThrow();
            });
        });
    });

    describe("invalid NewUser objects", () => {
        it("should throw AssertError for missing email", () => {
            const invalidUsers = [
                { name: "John Doe" }, // Missing email
                { email: "", name: "John Doe" }, // Empty email
            ];

            invalidUsers.forEach(user => {
                expect(() => assertIsNewUser(user)).toThrow(AssertError);
            });
        });

        it("should throw AssertError for invalid email format", () => {
            const invalidEmails = [
                { email: "not-an-email", name: "John Doe" },
                { email: "@example.com", name: "John Doe" },
                { email: "user@", name: "John Doe" },
                { email: "user@example", name: "John Doe" },
                { email: "user @example.com", name: "John Doe" },
            ];

            invalidEmails.forEach(user => {
                expect(() => assertIsNewUser(user)).toThrow(AssertError);
            });
        });

        it("should throw AssertError for missing name", () => {
            const invalidUsers = [
                { email: "test@example.com" }, // Missing name
                { email: "test@example.com", name: "" }, // Empty name
            ];

            invalidUsers.forEach(user => {
                expect(() => assertIsNewUser(user)).toThrow(AssertError);
            });
        });

        it("should accept whitespace-only name (schema doesn't trim)", () => {
            const user = { email: "test@example.com", name: "   " };
            expect(() => assertIsNewUser(user)).not.toThrow();
        });

        it("should throw AssertError for non-object inputs", () => {
            const invalidInputs = [
                null,
                undefined,
                "string",
                123,
                [],
                true,
                false,
            ];

            invalidInputs.forEach(input => {
                expect(() => assertIsNewUser(input)).toThrow(AssertError);
            });
        });
    });

    describe("error handling", () => {
        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsNewUser({});
            }).toThrow("Invalid new user");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom new user validation error";
            expect(() => {
                assertIsNewUser({}, customMessage);
            }).toThrow(customMessage);
        });

        it("should throw AssertError with issues", () => {
            try {
                assertIsNewUser({});
                expect.fail("Should have thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(AssertError);
                expect((error as AssertError).issues).toBeDefined();
                expect((error as AssertError).issues?.length).toBeGreaterThan(
                    0,
                );
            }
        });
    });

    describe("type narrowing", () => {
        it("should narrow type correctly", () => {
            const value: unknown = {
                email: "test@example.com",
                name: "John Doe",
            };
            assertIsNewUser(value);
            expectTypeOf(value).toEqualTypeOf<NewUser>();
        });
    });
});

describe("assertIsUserChatPreferences", () => {
    const validPersonalities = Object.values(AI_PERSONALITIES).map(p => p.id);

    describe("valid UserChatPreferences objects", () => {
        it("should not throw for valid preferences with required personality", () => {
            validPersonalities.forEach(personality => {
                const preferences = {
                    personality,
                };
                expect(() =>
                    assertIsUserChatPreferences(preferences),
                ).not.toThrow();
            });
        });

        it("should not throw for valid preferences with all fields", () => {
            const preferences = {
                personality: validPersonalities[0],
                nickname: "Cool Nickname",
                role: "Software Engineer",
                extraInfo: "Some extra information",
                characteristics: "Friendly and helpful",
            };

            expect(() =>
                assertIsUserChatPreferences(preferences),
            ).not.toThrow();
        });

        it("should not throw for valid preferences with optional fields", () => {
            const preferences = {
                personality: validPersonalities[0],
                nickname: "Nick",
            };

            expect(() =>
                assertIsUserChatPreferences(preferences),
            ).not.toThrow();
        });

        it("should accept empty strings for optional fields", () => {
            const preferences = {
                personality: validPersonalities[0],
                nickname: "",
                role: "",
                extraInfo: "",
                characteristics: "",
            };

            expect(() =>
                assertIsUserChatPreferences(preferences),
            ).not.toThrow();
        });
    });

    describe("invalid UserChatPreferences objects", () => {
        it("should throw AssertError for missing personality", () => {
            const invalidPreferences = [
                {}, // Missing personality
                { nickname: "Test" }, // Missing personality
            ];

            invalidPreferences.forEach(prefs => {
                expect(() => assertIsUserChatPreferences(prefs)).toThrow(
                    AssertError,
                );
            });
        });

        it("should throw AssertError for invalid personality", () => {
            const invalidPreferences = [
                { personality: "INVALID_PERSONALITY" },
                { personality: "" },
                { personality: null },
                { personality: 123 },
            ];

            invalidPreferences.forEach(prefs => {
                expect(() => assertIsUserChatPreferences(prefs)).toThrow(
                    AssertError,
                );
            });
        });

        it("should throw AssertError for nickname exceeding max length", () => {
            const preferences = {
                personality: validPersonalities[0],
                nickname: "A".repeat(26), // 26 chars, max is 25
            };

            expect(() => assertIsUserChatPreferences(preferences)).toThrow(
                AssertError,
            );
        });

        it("should throw AssertError for role exceeding max length", () => {
            const preferences = {
                personality: validPersonalities[0],
                role: "A".repeat(51), // 51 chars, max is 50
            };

            expect(() => assertIsUserChatPreferences(preferences)).toThrow(
                AssertError,
            );
        });

        it("should throw AssertError for extraInfo exceeding max length", () => {
            const preferences = {
                personality: validPersonalities[0],
                extraInfo: "A".repeat(151), // 151 chars, max is 150
            };

            expect(() => assertIsUserChatPreferences(preferences)).toThrow(
                AssertError,
            );
        });

        it("should throw AssertError for characteristics exceeding max length", () => {
            const preferences = {
                personality: validPersonalities[0],
                characteristics: "A".repeat(151), // 151 chars, max is 150
            };

            expect(() => assertIsUserChatPreferences(preferences)).toThrow(
                AssertError,
            );
        });

        it("should throw AssertError for non-object inputs", () => {
            const invalidInputs = [
                null,
                undefined,
                "string",
                123,
                [],
                true,
                false,
            ];

            invalidInputs.forEach(input => {
                expect(() => assertIsUserChatPreferences(input)).toThrow(
                    AssertError,
                );
            });
        });

        it("should throw AssertError for invalid field types", () => {
            const invalidPreferences = [
                { personality: validPersonalities[0], nickname: 123 },
                { personality: validPersonalities[0], role: 123 },
                { personality: validPersonalities[0], extraInfo: 123 },
                { personality: validPersonalities[0], characteristics: 123 },
            ];

            invalidPreferences.forEach(prefs => {
                expect(() => assertIsUserChatPreferences(prefs)).toThrow(
                    AssertError,
                );
            });
        });
    });

    describe("error handling", () => {
        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsUserChatPreferences({});
            }).toThrow("Invalid partial user chat preferences");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom preferences validation error";
            expect(() => {
                assertIsUserChatPreferences({}, customMessage);
            }).toThrow(customMessage);
        });

        it("should throw AssertError with issues", () => {
            try {
                assertIsUserChatPreferences({});
                expect.fail("Should have thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(AssertError);
                expect((error as AssertError).issues).toBeDefined();
                expect((error as AssertError).issues?.length).toBeGreaterThan(
                    0,
                );
            }
        });
    });

    describe("type narrowing", () => {
        it("should narrow type correctly", () => {
            const value: unknown = {
                personality: validPersonalities[0],
            };
            assertIsUserChatPreferences(value);
            expectTypeOf(value).toEqualTypeOf<Partial<DBUserChatPreferences>>();
        });
    });
});

describe("assertIsUserRole", () => {
    const validRoles: DBUserRole[] = [
        USER_ROLE.GUEST,
        USER_ROLE.USER,
        USER_ROLE.ADMIN,
    ];

    describe("valid UserRole values", () => {
        it("should not throw for valid role values", () => {
            validRoles.forEach(role => {
                expect(() => assertIsUserRole(role)).not.toThrow();
            });
        });

        it("should accept all enum values", () => {
            expect(() => assertIsUserRole("guest")).not.toThrow();
            expect(() => assertIsUserRole("user")).not.toThrow();
            expect(() => assertIsUserRole("admin")).not.toThrow();
        });
    });

    describe("invalid UserRole values", () => {
        it("should throw AssertError for invalid role strings", () => {
            const invalidRoles = [
                "invalid_role",
                "GUEST", // Wrong case
                "ADMIN", // Wrong case
                "USER", // Wrong case
                "",
                "guest ", // Trailing space
                " admin", // Leading space
                null,
                undefined,
                123,
                {},
                [],
                true,
                false,
            ];

            invalidRoles.forEach(role => {
                expect(() => assertIsUserRole(role)).toThrow(AssertError);
            });
        });
    });

    describe("error handling", () => {
        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsUserRole("invalid");
            }).toThrow("Invalid user role");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom role validation error";
            expect(() => {
                assertIsUserRole("invalid", customMessage);
            }).toThrow(customMessage);
        });

        it("should throw AssertError with issues", () => {
            try {
                assertIsUserRole("invalid");
                expect.fail("Should have thrown");
            } catch (error) {
                expect(error).toBeInstanceOf(AssertError);
                expect((error as AssertError).issues).toBeDefined();
                expect((error as AssertError).issues?.length).toBeGreaterThan(
                    0,
                );
            }
        });
    });

    describe("type narrowing", () => {
        it("should narrow type correctly", () => {
            const value: unknown = USER_ROLE.USER;
            assertIsUserRole(value);
            expectTypeOf(value).toEqualTypeOf<DBUserRole>();
        });
    });
});
