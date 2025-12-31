import { describe, expect, expectTypeOf, it } from "vitest";

import { toCamelCase } from "./to-camel-case";

describe("toCamelCase", () => {
    it("should convert snake_case to camelCase", () => {
        expect(toCamelCase("hello_world")).toBe("helloWorld");
    });

    it("should convert kebab-case to camelCase", () => {
        expect(toCamelCase("hello-world")).toBe("helloWorld");
    });

    it("should convert with default delimiters", () => {
        expect(toCamelCase("hello_world-test")).toBe("helloWorldTest");
    });

    it("should handle single word", () => {
        expect(toCamelCase("hello")).toBe("hello");
    });

    it("should handle multiple delimiters", () => {
        expect(toCamelCase("hello_world-test")).toBe("helloWorldTest");
    });

    it("should handle custom delimiters", () => {
        expect(toCamelCase("hello.world", ["."])).toBe("helloWorld");
    });

    it("should handle multiple custom delimiters", () => {
        expect(toCamelCase("hello|world|test", ["|"])).toBe("helloWorldTest");
    });

    it("should handle consecutive delimiters", () => {
        expect(toCamelCase("hello__world")).toBe("helloWorld");
    });

    it("should handle numbers", () => {
        expect(toCamelCase("test_123_value")).toBe("test123Value");
    });

    it("should handle uppercase input", () => {
        expect(toCamelCase("HELLO_WORLD")).toBe("helloWorld");
    });

    it("should handle mixed case input", () => {
        expect(toCamelCase("Hello_World_Test")).toBe("helloWorldTest");
    });

    it("should handle empty string", () => {
        expect(toCamelCase("")).toBe("");
    });

    it("should handle string starting with delimiter", () => {
        expect(toCamelCase("_hello_world")).toBe("HelloWorld");
    });

    it("should handle custom single delimiter", () => {
        expect(toCamelCase("hello.world.test", ["."])).toBe("helloWorldTest");
    });

    it("should handle space as delimiter", () => {
        expect(toCamelCase("hello world test", [" "])).toBe("helloWorldTest");
    });

    describe("type tests", () => {
        it("should return camelCase type", () => {
            const result = toCamelCase("hello_world");
            expectTypeOf(result).toEqualTypeOf<"helloWorld">();
        });

        it("should accept string type parameter", () => {
            const str: string = "test_string";
            const result = toCamelCase(str);
            expectTypeOf(result).toBeString();
        });

        it("should accept array of delimiters", () => {
            const result = toCamelCase("test.string", ["_", "-", "."]);
            expectTypeOf(result).toEqualTypeOf<"testString">();
        });
    });
});
