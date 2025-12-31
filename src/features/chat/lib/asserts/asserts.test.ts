import { describe, expect, expectTypeOf, it } from "vitest";

import {
    CHAT_ROLE,
    CHAT_TRIGGER,
    CHAT_VISIBILITY,
} from "@/features/chat/lib/constants";
import { AI_PERSONALITIES } from "@/features/chat/lib/constants";
import type {
    ChatRequestBody,
    DBChat,
    DBChatId,
    DBChatMessageId,
    DBChatVisibility,
    StoredUploadedFile,
} from "@/features/chat/lib/types";

import { AssertError } from "@/lib/classes";

import {
    assertIsChatRequestBodyValid,
    assertIsChatTitle,
    assertIsChatVisibility,
    assertIsDBChatId,
    assertIsDBChatIds,
    assertIsDBChatMessageId,
    assertIsDownvote,
    assertIsPartialChatDataValid,
    assertIsStoredUploadedFile,
    assertIsStoredUploadedFiles,
    assertIsUpvote,
} from "./asserts";

describe("assertIsDBChatId", () => {
    describe("valid UUIDs", () => {
        it("should not throw for valid UUID strings", () => {
            const validUUIDs = [
                "550e8400-e29b-41d4-a716-446655440000",
                "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                "00000000-0000-0000-0000-000000000000",
                "ffffffff-ffff-ffff-ffff-ffffffffffff",
            ];

            validUUIDs.forEach(uuid => {
                expect(() => assertIsDBChatId(uuid)).not.toThrow();
            });
        });
    });

    describe("invalid UUIDs", () => {
        it("should throw AssertError for invalid UUID strings", () => {
            const invalidUUIDs = [
                "not-a-uuid",
                "550e8400-e29b-41d4-a716",
                "550e8400-e29b-41d4-a716-446655440000-extra",
                "550e8400e29b41d4a716446655440000",
                "",
                "550e8400-e29b-41d4-a716-44665544g000",
                null,
                undefined,
                123,
                {},
                [],
            ];

            invalidUUIDs.forEach(uuid => {
                expect(() => assertIsDBChatId(uuid)).toThrow(AssertError);
            });
        });
    });

    describe("error handling", () => {
        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsDBChatId("invalid");
            }).toThrow("Invalid chatId");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom chatId validation error";
            expect(() => {
                assertIsDBChatId("invalid", customMessage);
            }).toThrow(customMessage);
        });

        it("should throw AssertError with issues", () => {
            try {
                assertIsDBChatId("invalid");
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
            assertIsDBChatId(value);
            expectTypeOf(value).toEqualTypeOf<DBChatId>();
        });
    });
});

describe("assertIsDBChatIds", () => {
    describe("valid UUID arrays", () => {
        it("should not throw for valid UUID arrays", () => {
            const validArrays = [
                ["550e8400-e29b-41d4-a716-446655440000"],
                [
                    "550e8400-e29b-41d4-a716-446655440000",
                    "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
                ],
                [],
            ];

            validArrays.forEach(arr => {
                expect(() => assertIsDBChatIds(arr)).not.toThrow();
            });
        });
    });

    describe("invalid UUID arrays", () => {
        it("should throw AssertError for arrays with invalid UUIDs", () => {
            const invalidArrays = [
                ["not-a-uuid"],
                ["550e8400-e29b-41d4-a716-446655440000", "invalid"],
                [null],
                [undefined],
                [123],
                {},
            ];

            invalidArrays.forEach(arr => {
                expect(() => assertIsDBChatIds(arr)).toThrow(AssertError);
            });
        });

        it("should throw AssertError for non-array values", () => {
            const nonArrays = [
                "not-an-array",
                null,
                undefined,
                123,
                {},
                "550e8400-e29b-41d4-a716-446655440000",
            ];

            nonArrays.forEach(value => {
                expect(() => assertIsDBChatIds(value)).toThrow(AssertError);
            });
        });
    });

    describe("error handling", () => {
        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsDBChatIds("invalid");
            }).toThrow("Invalid chatIds");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom chatIds validation error";
            expect(() => {
                assertIsDBChatIds("invalid", customMessage);
            }).toThrow(customMessage);
        });
    });

    describe("type narrowing", () => {
        it("should narrow type correctly", () => {
            const value: unknown = ["550e8400-e29b-41d4-a716-446655440000"];
            assertIsDBChatIds(value);
            expectTypeOf(value).toEqualTypeOf<DBChatId[]>();
        });
    });
});

describe("assertIsDBChatMessageId", () => {
    describe("valid UUIDs", () => {
        it("should not throw for valid UUID strings", () => {
            const validUUIDs = [
                "550e8400-e29b-41d4-a716-446655440000",
                "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
            ];

            validUUIDs.forEach(uuid => {
                expect(() => assertIsDBChatMessageId(uuid)).not.toThrow();
            });
        });
    });

    describe("invalid UUIDs", () => {
        it("should throw AssertError for invalid UUID strings", () => {
            const invalidUUIDs = [
                "not-a-uuid",
                "",
                null,
                undefined,
                123,
                {},
                [],
            ];

            invalidUUIDs.forEach(uuid => {
                expect(() => assertIsDBChatMessageId(uuid)).toThrow(
                    AssertError,
                );
            });
        });
    });

    describe("error handling", () => {
        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsDBChatMessageId("invalid");
            }).toThrow("Invalid chat message ID");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom message ID validation error";
            expect(() => {
                assertIsDBChatMessageId("invalid", customMessage);
            }).toThrow(customMessage);
        });
    });

    describe("type narrowing", () => {
        it("should narrow type correctly", () => {
            const value: unknown = "550e8400-e29b-41d4-a716-446655440000";
            assertIsDBChatMessageId(value);
            expectTypeOf(value).toEqualTypeOf<DBChatMessageId>();
        });
    });
});

describe("assertIsChatTitle", () => {
    describe("valid strings", () => {
        it("should not throw for valid string values", () => {
            const validStrings = [
                "My Chat",
                "Test",
                "",
                "A very long chat title that might be truncated",
                "123",
                "Special chars: !@#$%",
            ];

            validStrings.forEach(str => {
                expect(() => assertIsChatTitle(str)).not.toThrow();
            });
        });
    });

    describe("invalid values", () => {
        it("should throw AssertError for non-string values", () => {
            const invalidValues = [null, undefined, 123, {}, [], true, false];

            invalidValues.forEach(value => {
                expect(() => assertIsChatTitle(value)).toThrow(AssertError);
            });
        });
    });

    describe("error handling", () => {
        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsChatTitle(null);
            }).toThrow("Invalid chat title");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom title validation error";
            expect(() => {
                assertIsChatTitle(null, customMessage);
            }).toThrow(customMessage);
        });
    });

    describe("type narrowing", () => {
        it("should narrow type correctly", () => {
            const value: unknown = "My Chat Title";
            assertIsChatTitle(value);
            expectTypeOf(value).toEqualTypeOf<string>();
        });
    });
});

describe("assertIsChatVisibility", () => {
    describe("valid visibility values", () => {
        it("should not throw for valid visibility strings", () => {
            const validValues = [
                CHAT_VISIBILITY.PUBLIC,
                CHAT_VISIBILITY.PRIVATE,
            ];

            validValues.forEach(visibility => {
                expect(() => assertIsChatVisibility(visibility)).not.toThrow();
            });
        });
    });

    describe("invalid visibility values", () => {
        it("should throw AssertError for invalid visibility strings", () => {
            const invalidValues = [
                "invalid",
                "PUBLIC",
                "PRIVATE",
                "visible",
                "",
                null,
                undefined,
                123,
                {},
                [],
            ];

            invalidValues.forEach(value => {
                expect(() => assertIsChatVisibility(value)).toThrow(
                    AssertError,
                );
            });
        });
    });

    describe("error handling", () => {
        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsChatVisibility("invalid");
            }).toThrow("Invalid chat visibility");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom visibility validation error";
            expect(() => {
                assertIsChatVisibility("invalid", customMessage);
            }).toThrow(customMessage);
        });
    });

    describe("type narrowing", () => {
        it("should narrow type correctly", () => {
            const value: unknown = CHAT_VISIBILITY.PUBLIC;
            assertIsChatVisibility(value);
            expectTypeOf(value).toEqualTypeOf<DBChatVisibility>();
        });
    });
});

describe("assertIsUpvote", () => {
    describe("valid boolean values", () => {
        it("should not throw for valid boolean values", () => {
            expect(() => assertIsUpvote(true)).not.toThrow();
            expect(() => assertIsUpvote(false)).not.toThrow();
        });
    });

    describe("invalid values", () => {
        it("should throw AssertError for non-boolean values", () => {
            const invalidValues = [
                null,
                undefined,
                "true",
                "false",
                1,
                0,
                {},
                [],
                "yes",
                "no",
            ];

            invalidValues.forEach(value => {
                expect(() => assertIsUpvote(value)).toThrow(AssertError);
            });
        });
    });

    describe("error handling", () => {
        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsUpvote(null);
            }).toThrow("Invalid upvote");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom upvote validation error";
            expect(() => {
                assertIsUpvote(null, customMessage);
            }).toThrow(customMessage);
        });
    });

    describe("type narrowing", () => {
        it("should narrow type correctly", () => {
            const value: unknown = true;
            assertIsUpvote(value);
            expectTypeOf(value).toEqualTypeOf<boolean>();
        });
    });
});

describe("assertIsDownvote", () => {
    describe("valid boolean values", () => {
        it("should not throw for valid boolean values", () => {
            expect(() => assertIsDownvote(true)).not.toThrow();
            expect(() => assertIsDownvote(false)).not.toThrow();
        });
    });

    describe("invalid values", () => {
        it("should throw AssertError for non-boolean values", () => {
            const invalidValues = [
                null,
                undefined,
                "true",
                "false",
                1,
                0,
                {},
                [],
            ];

            invalidValues.forEach(value => {
                expect(() => assertIsDownvote(value)).toThrow(AssertError);
            });
        });
    });

    describe("error handling", () => {
        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsDownvote(null);
            }).toThrow("Invalid downvote");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom downvote validation error";
            expect(() => {
                assertIsDownvote(null, customMessage);
            }).toThrow(customMessage);
        });
    });

    describe("type narrowing", () => {
        it("should narrow type correctly", () => {
            const value: unknown = false;
            assertIsDownvote(value);
            expectTypeOf(value).toEqualTypeOf<boolean>();
        });
    });
});

describe("assertIsChatRequestBodyValid", () => {
    const createValidChatRequestBody = (): ChatRequestBody => ({
        chatId: "550e8400-e29b-41d4-a716-446655440000" as DBChatId,
        trigger: CHAT_TRIGGER.SUBMIT_MESSAGE,
        message: {
            id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8" as DBChatMessageId,
            role: CHAT_ROLE.USER,
            metadata: {
                role: "user",
                createdAt: new Date().toISOString(),
            },
            parts: [
                {
                    type: "text",
                    text: "Hello, this is a test message with enough characters",
                },
            ],
        },
        userChatPreferences: {
            personality: AI_PERSONALITIES.FRIENDLY.id,
        } as any,
        body: {},
    });

    describe("valid request bodies", () => {
        it("should not throw for valid request body with all required fields", () => {
            const validBody = createValidChatRequestBody();
            expect(() => assertIsChatRequestBodyValid(validBody)).not.toThrow();
        });

        it("should not throw for valid request body with optional fields", () => {
            const validBody: ChatRequestBody = {
                ...createValidChatRequestBody(),
                messageId:
                    "7ba7b810-9dad-11d1-80b4-00c04fd430c8" as DBChatMessageId,
                newChatId: "8ba7b810-9dad-11d1-80b4-00c04fd430c8" as DBChatId,
                body: {
                    regeneratedMessageRole: CHAT_ROLE.ASSISTANT,
                },
            };
            expect(() => assertIsChatRequestBodyValid(validBody)).not.toThrow();
        });

        it("should not throw for valid request body with null userChatPreferences", () => {
            const validBody: ChatRequestBody = {
                ...createValidChatRequestBody(),
                userChatPreferences: null,
            };
            expect(() => assertIsChatRequestBodyValid(validBody)).not.toThrow();
        });
    });

    describe("invalid values", () => {
        it("should throw AssertError for non-object values", () => {
            const invalidValues = [null, undefined, "string", 123, [], true];

            invalidValues.forEach(value => {
                expect(() => assertIsChatRequestBodyValid(value)).toThrow(
                    AssertError,
                );
            });
        });

        it("should throw AssertError for empty object", () => {
            expect(() => assertIsChatRequestBodyValid({})).toThrow(AssertError);
        });

        it("should throw AssertError for missing required fields", () => {
            const invalidBodies = [
                { chatId: "550e8400-e29b-41d4-a716-446655440000" },
                {
                    chatId: "550e8400-e29b-41d4-a716-446655440000",
                    trigger: CHAT_TRIGGER.SUBMIT_MESSAGE,
                },
                {
                    chatId: "550e8400-e29b-41d4-a716-446655440000",
                    trigger: CHAT_TRIGGER.SUBMIT_MESSAGE,
                    message: {},
                },
            ];

            invalidBodies.forEach(body => {
                expect(() => assertIsChatRequestBodyValid(body)).toThrow(
                    AssertError,
                );
            });
        });

        it("should throw AssertError for invalid chatId UUID", () => {
            const invalidBody = {
                ...createValidChatRequestBody(),
                chatId: "invalid-uuid",
            };
            expect(() => assertIsChatRequestBodyValid(invalidBody)).toThrow(
                AssertError,
            );
        });

        it("should throw AssertError for invalid trigger enum", () => {
            const invalidBody = {
                ...createValidChatRequestBody(),
                trigger: "invalid-trigger",
            };
            expect(() => assertIsChatRequestBodyValid(invalidBody)).toThrow(
                AssertError,
            );
        });

        it("should throw AssertError for invalid message structure", () => {
            const invalidBodies = [
                {
                    ...createValidChatRequestBody(),
                    message: {
                        id: "invalid",
                        role: "user",
                    },
                },
                {
                    ...createValidChatRequestBody(),
                    message: {
                        id: "550e8400-e29b-41d4-a716-446655440000",
                        role: "invalid-role",
                    },
                },
                {
                    ...createValidChatRequestBody(),
                    message: {
                        id: "550e8400-e29b-41d4-a716-446655440000",
                        role: CHAT_ROLE.USER,
                        metadata: {},
                        parts: [],
                    },
                },
            ];

            invalidBodies.forEach(body => {
                expect(() => assertIsChatRequestBodyValid(body)).toThrow(
                    AssertError,
                );
            });
        });

        it("should throw AssertError for invalid messageId UUID", () => {
            const invalidBody = {
                ...createValidChatRequestBody(),
                messageId: "invalid-uuid",
            };
            expect(() => assertIsChatRequestBodyValid(invalidBody)).toThrow(
                AssertError,
            );
        });

        it("should throw AssertError for invalid newChatId UUID", () => {
            const invalidBody = {
                ...createValidChatRequestBody(),
                newChatId: "invalid-uuid",
            };
            expect(() => assertIsChatRequestBodyValid(invalidBody)).toThrow(
                AssertError,
            );
        });

        it("should throw AssertError for invalid regeneratedMessageRole", () => {
            const invalidBody = {
                ...createValidChatRequestBody(),
                body: {
                    regeneratedMessageRole: "invalid-role",
                },
            };
            expect(() => assertIsChatRequestBodyValid(invalidBody)).toThrow(
                AssertError,
            );
        });

        it("should throw AssertError for invalid userChatPreferences", () => {
            const invalidBody = {
                ...createValidChatRequestBody(),
                userChatPreferences: {
                    personality: "INVALID_PERSONALITY",
                },
            };
            expect(() => assertIsChatRequestBodyValid(invalidBody)).toThrow(
                AssertError,
            );
        });
    });

    describe("error handling", () => {
        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsChatRequestBodyValid(null);
            }).toThrow("Invalid chat request body");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom request body validation error";
            expect(() => {
                assertIsChatRequestBodyValid(null, customMessage);
            }).toThrow(customMessage);
        });
    });

    describe("type narrowing", () => {
        it("should narrow type correctly when valid", () => {
            const value: unknown = createValidChatRequestBody();
            assertIsChatRequestBodyValid(value);
            expectTypeOf(value).toEqualTypeOf<ChatRequestBody>();
        });
    });
});

describe("assertIsPartialChatDataValid", () => {
    describe("valid partial chat data", () => {
        it("should not throw for empty object", () => {
            expect(() => assertIsPartialChatDataValid({})).not.toThrow();
        });

        it("should not throw for partial chat data with title", () => {
            expect(() =>
                assertIsPartialChatDataValid({ title: "New Title" }),
            ).not.toThrow();
        });

        it("should not throw for partial chat data with visibility", () => {
            expect(() =>
                assertIsPartialChatDataValid({
                    visibility: CHAT_VISIBILITY.PUBLIC,
                }),
            ).not.toThrow();
        });
    });

    describe("invalid values", () => {
        it("should throw AssertError for non-object values", () => {
            const invalidValues = [null, undefined, "string", 123, [], true];

            invalidValues.forEach(value => {
                expect(() => assertIsPartialChatDataValid(value)).toThrow(
                    AssertError,
                );
            });
        });
    });

    describe("error handling", () => {
        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsPartialChatDataValid(null);
            }).toThrow("Invalid chat data");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom chat data validation error";
            expect(() => {
                assertIsPartialChatDataValid(null, customMessage);
            }).toThrow(customMessage);
        });
    });

    describe("type narrowing", () => {
        it("should narrow type correctly", () => {
            const value: unknown = { title: "Test" };
            assertIsPartialChatDataValid(value);
            expectTypeOf(value).toEqualTypeOf<Partial<DBChat>>();
        });
    });
});

describe("assertIsStoredUploadedFile", () => {
    describe("valid file objects", () => {
        it("should not throw for valid file object", () => {
            const validFile: StoredUploadedFile = {
                fileId: "550e8400-e29b-41d4-a716-446655440000",
                name: "document.pdf",
                fileUrl: "https://example.com/document.pdf",
                mediaType: "application/pdf",
                extension: "pdf",
                size: 1024,
            };

            expect(() => assertIsStoredUploadedFile(validFile)).not.toThrow();
        });
    });

    describe("invalid file objects", () => {
        it("should throw AssertError for non-object values", () => {
            const invalidValues = [null, undefined, "string", 123, [], true];

            invalidValues.forEach(value => {
                expect(() => assertIsStoredUploadedFile(value)).toThrow(
                    AssertError,
                );
            });
        });

        it("should throw AssertError for objects missing required fields", () => {
            const invalidFiles = [
                {},
                { fileId: "id" },
                { fileId: "id", name: "file.pdf" },
                { fileId: "id", name: "file.pdf", fileUrl: "url" },
            ];

            invalidFiles.forEach(file => {
                expect(() => assertIsStoredUploadedFile(file)).toThrow(
                    AssertError,
                );
            });
        });
    });

    describe("error handling", () => {
        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsStoredUploadedFile(null);
            }).toThrow("Invalid file data");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom file validation error";
            expect(() => {
                assertIsStoredUploadedFile(null, customMessage);
            }).toThrow(customMessage);
        });
    });

    describe("type narrowing", () => {
        it("should narrow type correctly", () => {
            const value: unknown = {
                fileId: "550e8400-e29b-41d4-a716-446655440000",
                name: "document.pdf",
                fileUrl: "https://example.com/document.pdf",
                mediaType: "application/pdf",
                extension: "pdf",
                size: 1024,
            };
            assertIsStoredUploadedFile(value);
            expectTypeOf(value).toEqualTypeOf<StoredUploadedFile>();
        });
    });
});

describe("assertIsStoredUploadedFiles", () => {
    describe("valid file arrays", () => {
        it("should not throw for empty array", () => {
            expect(() => assertIsStoredUploadedFiles([])).not.toThrow();
        });

        it("should not throw for array with valid files", () => {
            const validFiles: StoredUploadedFile[] = [
                {
                    fileId: "550e8400-e29b-41d4-a716-446655440000",
                    name: "document.pdf",
                    fileUrl: "https://example.com/document.pdf",
                    mediaType: "application/pdf",
                    extension: "pdf",
                    size: 1024,
                },
            ];

            expect(() => assertIsStoredUploadedFiles(validFiles)).not.toThrow();
        });
    });

    describe("invalid file arrays", () => {
        it("should throw AssertError for non-array values", () => {
            const invalidValues = [null, undefined, "string", 123, {}, true];

            invalidValues.forEach(value => {
                expect(() => assertIsStoredUploadedFiles(value)).toThrow(
                    AssertError,
                );
            });
        });

        it("should throw AssertError for arrays with invalid files", () => {
            const invalidArrays = [
                [{}],
                [{ fileId: "id" }],
                [null],
                [undefined],
            ];

            invalidArrays.forEach(arr => {
                expect(() => assertIsStoredUploadedFiles(arr)).toThrow(
                    AssertError,
                );
            });
        });
    });

    describe("error handling", () => {
        it("should throw AssertError with default message", () => {
            expect(() => {
                assertIsStoredUploadedFiles(null);
            }).toThrow("Invalid files data");
        });

        it("should throw AssertError with custom message", () => {
            const customMessage = "Custom files validation error";
            expect(() => {
                assertIsStoredUploadedFiles(null, customMessage);
            }).toThrow(customMessage);
        });
    });

    describe("type narrowing", () => {
        it("should narrow type correctly", () => {
            const value: unknown = [
                {
                    fileId: "550e8400-e29b-41d4-a716-446655440000",
                    name: "document.pdf",
                    fileUrl: "https://example.com/document.pdf",
                    mediaType: "application/pdf",
                    extension: "pdf",
                    size: 1024,
                },
            ];
            assertIsStoredUploadedFiles(value);
            expectTypeOf(value).toEqualTypeOf<StoredUploadedFile[]>();
        });
    });
});
