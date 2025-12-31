import { describe, expect, it } from "vitest";

import { formatMessage } from "./utils";

describe("formatMessage", () => {
    describe("simple placeholder replacement", () => {
        it("should return message when no placeholders provided", () => {
            const result = formatMessage("Hello World");
            expect(result).toBe("Hello World");
        });

        it("should return message when placeholders object is undefined", () => {
            const result = formatMessage("Hello World", undefined);
            expect(result).toBe("Hello World");
        });

        it("should replace single placeholder with string value", () => {
            const result = formatMessage("Hello {name}", { name: "World" });
            expect(result).toBe("Hello World");
        });

        it("should replace single placeholder with number value", () => {
            const result = formatMessage("Count: {count}", { count: 42 });
            expect(result).toBe("Count: 42");
        });

        it("should replace multiple placeholders", () => {
            const result = formatMessage("Hello {name}, age {age}", {
                name: "Alice",
                age: 30,
            });
            expect(result).toBe("Hello Alice, age 30");
        });

        it("should replace same placeholder multiple times", () => {
            const result = formatMessage("{name} says hello to {name}", {
                name: "Bob",
            });
            expect(result).toBe("Bob says hello to Bob");
        });

        it("should handle empty string replacement", () => {
            const result = formatMessage("Hello {name}", { name: "" });
            expect(result).toBe("Hello ");
        });

        it("should handle zero as replacement", () => {
            const result = formatMessage("Count: {count}", { count: 0 });
            expect(result).toBe("Count: 0");
        });

        it("should handle negative numbers", () => {
            const result = formatMessage("Temperature: {temp}", { temp: -10 });
            expect(result).toBe("Temperature: -10");
        });

        it("should handle decimal numbers", () => {
            const result = formatMessage("Price: {price}", { price: 99.99 });
            expect(result).toBe("Price: 99.99");
        });
    });

    describe("ICU plural formatting", () => {
        it("should handle plural with exact match", () => {
            const message =
                "{count, plural, =0 [no items] =1 [one item] other [# items]}";
            expect(formatMessage(message, { count: 0 })).toBe("no items");
            expect(formatMessage(message, { count: 1 })).toBe("one item");
            expect(formatMessage(message, { count: 5 })).toBe("5 items");
        });

        it("should handle plural with 'one' keyword", () => {
            const message = "{count, plural, one [one item] other [# items]}";
            expect(formatMessage(message, { count: 1 })).toBe("one item");
            expect(formatMessage(message, { count: 0 })).toBe("0 items");
            expect(formatMessage(message, { count: 2 })).toBe("2 items");
        });

        it("should handle plural with 'other' keyword", () => {
            const message = "{count, plural, other [# items]}";
            expect(formatMessage(message, { count: 0 })).toBe("0 items");
            expect(formatMessage(message, { count: 1 })).toBe("1 items");
            expect(formatMessage(message, { count: 5 })).toBe("5 items");
        });

        it("should replace # with count in plural other clause", () => {
            const message = "{count, plural, other [You have # messages]}";
            expect(formatMessage(message, { count: 5 })).toBe(
                "You have 5 messages",
            );
            expect(formatMessage(message, { count: 0 })).toBe(
                "You have 0 messages",
            );
        });

        it("should handle plural with multiple exact matches", () => {
            const message =
                "{count, plural, =0 [none] =1 [one] =2 [two] other [#]}";
            expect(formatMessage(message, { count: 0 })).toBe("none");
            expect(formatMessage(message, { count: 1 })).toBe("one");
            expect(formatMessage(message, { count: 2 })).toBe("two");
            expect(formatMessage(message, { count: 3 })).toBe("3");
        });

        it("should prioritize exact match over one/other", () => {
            const message =
                "{count, plural, =1 [exactly one] one [one item] other [# items]}";
            expect(formatMessage(message, { count: 1 })).toBe("exactly one");
        });

        it("should return empty string when plural placeholder is missing", () => {
            const message = "{count, plural, one [one] other [#]}";
            const result = formatMessage(message, {});
            expect(result).toBe("");
        });

        it("should handle plural with additional placeholders", () => {
            const message =
                "{count, plural, one [one {type}] other [# {type}s]}";
            const result = formatMessage(message, {
                count: 5,
                type: "message",
            });
            expect(result).toContain("message");
        });

        it("should handle multiple plural expressions", () => {
            const message =
                "{fileCount, plural, one [file] other [files]} and {messageCount, plural, one [message] other [messages]}";
            const result = formatMessage(message, {
                fileCount: 1,
                messageCount: 5,
            });
            expect(result).toBe("file and messages");
        });

        it("should handle plural with whitespace in options", () => {
            const message =
                "{count, plural, one [ one item ] other [ # items ]}";
            expect(formatMessage(message, { count: 1 })).toBe(" one item ");
            expect(formatMessage(message, { count: 5 })).toBe(" 5 items ");
        });
    });

    describe("combined placeholder and plural", () => {
        it("should handle both simple placeholders and plural", () => {
            const message =
                "User {name} has {count, plural, one [one item] other [# items]}";
            const result = formatMessage(message, { name: "Alice", count: 5 });
            expect(result).toBe("User Alice has 5 items");
        });

        it("should handle complex message with multiple placeholders and plural", () => {
            const message =
                "{action} {count, plural, one [one item] other [# items]} for {user}";
            const result = formatMessage(message, {
                action: "Delete",
                count: 3,
                user: "admin",
            });
            expect(result).toBe("Delete 3 items for admin");
        });
    });

    describe("edge cases", () => {
        it("should handle empty message", () => {
            const result = formatMessage("", {});
            expect(result).toBe("");
        });

        it("should handle message with no placeholders", () => {
            const result = formatMessage("Static message", {});
            expect(result).toBe("Static message");
        });

        it("should handle placeholder that doesn't exist in message", () => {
            const result = formatMessage("Hello World", { unused: "value" });
            expect(result).toBe("Hello World");
        });

        it("should handle plural with count 0 using exact match", () => {
            const message = "{count, plural, =0 [zero] other [#]}";
            expect(formatMessage(message, { count: 0 })).toBe("zero");
        });

        it("should handle plural with large numbers", () => {
            const message = "{count, plural, one [one] other [#]}";
            expect(formatMessage(message, { count: 1000 })).toBe("1000");
            expect(formatMessage(message, { count: 999999 })).toBe("999999");
        });
    });
});
