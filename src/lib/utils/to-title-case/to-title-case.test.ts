import { describe, expect, expectTypeOf, it } from "vitest";

import { toTitleCase } from "./to-title-case";

describe("toTitleCase", () => {
    it("should convert snake_case to TitleCase", () => {
        expect(toTitleCase("hello_world")).toBe("HelloWorld");
    });

    it("should convert kebab-case to TitleCase", () => {
        expect(toTitleCase("hello-world")).toBe("HelloWorld");
    });

    it("should convert with default delimiters", () => {
        expect(toTitleCase("hello_world-test")).toBe("HelloWorldTest");
    });

    it("should handle single word", () => {
        expect(toTitleCase("hello")).toBe("Hello");
    });

    it("should handle multiple delimiters", () => {
        expect(toTitleCase("hello_world-test")).toBe("HelloWorldTest");
    });

    it("should handle custom delimiters", () => {
        expect(toTitleCase("hello.world", ["."])).toBe("HelloWorld");
    });

    it("should handle multiple custom delimiters", () => {
        expect(toTitleCase("hello|world|test", ["|"])).toBe("HelloWorldTest");
    });

    it("should handle consecutive delimiters", () => {
        expect(toTitleCase("hello__world")).toBe("HelloWorld");
    });

    it("should handle numbers", () => {
        expect(toTitleCase("test_123_value")).toBe("Test123Value");
    });

    it("should handle uppercase input", () => {
        expect(toTitleCase("HELLO_WORLD")).toBe("HelloWorld");
    });

    it("should handle mixed case input", () => {
        expect(toTitleCase("Hello_World_Test")).toBe("HelloWorldTest");
    });

    it("should handle empty string", () => {
        expect(toTitleCase("")).toBe("");
    });

    it("should handle string starting with delimiter", () => {
        expect(toTitleCase("_hello_world")).toBe("HelloWorld");
    });

    it("should handle custom single delimiter", () => {
        expect(toTitleCase("hello.world.test", ["."])).toBe("HelloWorldTest");
    });

    it("should handle space as delimiter", () => {
        expect(toTitleCase("hello world test", [" "])).toBe("HelloWorldTest");
    });

    describe("type tests", () => {
        it("should return TitleCase type", () => {
            const result = toTitleCase("hello_world");
            expectTypeOf(result).toEqualTypeOf<"HelloWorld">();
        });

        it("should accept string type parameter", () => {
            const str: string = "test_string";
            const result = toTitleCase(str);
            expectTypeOf(result).toBeString();
        });

        it("should accept array of delimiters", () => {
            const result = toTitleCase("test.string", ["_", "-", "."]);
            expectTypeOf(result).toEqualTypeOf<"TestString">();
        });
    });
});
