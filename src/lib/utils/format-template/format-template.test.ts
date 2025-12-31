import { describe, expect, expectTypeOf, it } from "vitest";

import { formatTemplate } from "./format-template";

describe("formatTemplate", () => {
    it("should replace single placeholder with string", () => {
        const result = formatTemplate("Hello {name}", { name: "World" });
        expect(result).toBe("Hello World");
    });

    it("should replace single placeholder with number", () => {
        const result = formatTemplate("Count: {count}", { count: 42 });
        expect(result).toBe("Count: 42");
    });

    it("should replace multiple placeholders", () => {
        const result = formatTemplate("Hello {name}, you are {age} years old", {
            name: "Alice",
            age: 30,
        });
        expect(result).toBe("Hello Alice, you are 30 years old");
    });

    it("should replace same placeholder multiple times", () => {
        const result = formatTemplate("{name} says hello to {name}", {
            name: "Bob",
        });
        expect(result).toBe("Bob says hello to Bob");
    });

    it("should keep placeholder if replacement is missing", () => {
        const result = formatTemplate("Hello {name}", {} as any);
        expect(result).toBe("Hello {name}");
    });

    it("should handle empty template", () => {
        const result = formatTemplate("", {});
        expect(result).toBe("");
    });

    it("should handle template with no placeholders", () => {
        const result = formatTemplate("Hello World", {});
        expect(result).toBe("Hello World");
    });

    it("should handle template with only placeholders", () => {
        const result = formatTemplate("{greeting}", { greeting: "Hello" });
        expect(result).toBe("Hello");
    });

    it("should handle placeholders at the beginning", () => {
        const result = formatTemplate("{name} is here", { name: "John" });
        expect(result).toBe("John is here");
    });

    it("should handle placeholders at the end", () => {
        const result = formatTemplate("Welcome {name}", { name: "Jane" });
        expect(result).toBe("Welcome Jane");
    });

    it("should handle placeholders in the middle", () => {
        const result = formatTemplate("Start {middle} end", {
            middle: "middle",
        });
        expect(result).toBe("Start middle end");
    });

    it("should convert number to string", () => {
        const result = formatTemplate("Number: {num}", { num: 123 });
        expect(result).toBe("Number: 123");
    });

    it("should handle zero as replacement", () => {
        const result = formatTemplate("Count: {count}", { count: 0 });
        expect(result).toBe("Count: 0");
    });

    it("should handle negative numbers", () => {
        const result = formatTemplate("Temperature: {temp}", { temp: -10 });
        expect(result).toBe("Temperature: -10");
    });

    it("should handle decimal numbers", () => {
        const result = formatTemplate("Price: {price}", { price: 99.99 });
        expect(result).toBe("Price: 99.99");
    });

    it("should handle multiple different placeholders", () => {
        const result = formatTemplate(
            "{greeting} {name}, you have {count} messages",
            {
                greeting: "Hi",
                name: "Alice",
                count: 5,
            },
        );
        expect(result).toBe("Hi Alice, you have 5 messages");
    });

    it("should handle placeholders with underscores", () => {
        const result = formatTemplate("Value: {user_name}", {
            user_name: "test_user",
        });
        expect(result).toBe("Value: test_user");
    });

    it("should handle placeholders with numbers in name", () => {
        const result = formatTemplate("Item {item1} and {item2}", {
            item1: "A",
            item2: "B",
        });
        expect(result).toBe("Item A and B");
    });

    it("should handle empty string replacement", () => {
        const result = formatTemplate("Hello {name}", { name: "" });
        expect(result).toBe("Hello ");
    });

    it("should handle complex template with mixed content", () => {
        const result = formatTemplate(
            "User {username} (ID: {id}) has {count} items",
            {
                username: "john_doe",
                id: 12345,
                count: 7,
            },
        );
        expect(result).toBe("User john_doe (ID: 12345) has 7 items");
    });

    describe("type tests", () => {
        it("should return string type", () => {
            const result = formatTemplate("Hello {name}", { name: "World" });
            expectTypeOf(result).toEqualTypeOf<string>();
        });

        it("should require all placeholders", () => {
            formatTemplate("Hello {name} {greeting}", {
                name: "World",
                greeting: "Hi",
            });
            // @ts-expect-error missing 'greeting' placeholder
            formatTemplate("Hello {name} {greeting}", { name: "World" });
        });

        it("should accept string or number values", () => {
            formatTemplate("Count: {count}", { count: 42 });
            formatTemplate("Count: {count}", { count: "42" });
        });
    });
});
