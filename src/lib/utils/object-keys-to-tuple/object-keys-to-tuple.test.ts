import { describe, expect, expectTypeOf, it } from "vitest";

import { objectKeysToTuple } from "./object-keys-to-tuple";

describe("objectKeysToTuple", () => {
    it("should return keys as tuple without callback", () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = objectKeysToTuple(obj);

        expect(result).toEqual(["a", "b", "c"]);
    });

    it("should return keys in correct order", () => {
        const obj = { z: 1, a: 2, m: 3 };
        const result = objectKeysToTuple(obj);

        expect(result).toEqual(["z", "a", "m"]);
    });

    it("should handle empty object", () => {
        const obj = {};
        const result = objectKeysToTuple(obj);

        expect(result).toEqual([]);
    });

    it("should handle single key", () => {
        const obj = { key: "value" };
        const result = objectKeysToTuple(obj);

        expect(result).toEqual(["key"]);
    });

    it("should transform keys with callback", () => {
        const obj = { a: 1, b: 2 };
        const result = objectKeysToTuple(obj, key => key.toUpperCase());

        expect(result).toEqual(["A", "B"]);
    });

    it("should handle callback that adds prefix", () => {
        const obj = { name: "test", age: 20 };
        const result = objectKeysToTuple(obj, key => `prefix_${key}`);

        expect(result).toEqual(["prefix_name", "prefix_age"]);
    });

    it("should handle callback that transforms to different format", () => {
        const obj = { firstName: "John", lastName: "Doe" };
        const result = objectKeysToTuple(obj, key =>
            key.replace(/([A-Z])/g, "_$1").toLowerCase(),
        );

        expect(result).toEqual(["first_name", "last_name"]);
    });

    it("should preserve key order with callback", () => {
        const obj = { first: 1, second: 2, third: 3 };
        const result = objectKeysToTuple(obj, key => `item_${key}`);

        expect(result).toEqual(["item_first", "item_second", "item_third"]);
    });

    it("should handle numeric string keys", () => {
        const obj = { "1": "one", "2": "two", "3": "three" };
        const result = objectKeysToTuple(obj);

        expect(result).toEqual(["1", "2", "3"]);
    });

    it("should handle special character keys", () => {
        const obj = { "key-1": "value1", key_2: "value2" };
        const result = objectKeysToTuple(obj);

        expect(result).toEqual(["key-1", "key_2"]);
    });

    describe("type tests", () => {
        it("should return tuple of keys without callback", () => {
            const obj = { a: 1, b: 2, c: 3 } as const;
            const result = objectKeysToTuple(obj);
            expectTypeOf(result).toEqualTypeOf<["a", "b", "c"]>();
        });

        it("should return tuple of transformed keys with callback", () => {
            const obj = { a: 1, b: 2 } as const;
            const result = objectKeysToTuple(obj, key => `key_${key}`);
            expectTypeOf(result).toEqualTypeOf<["key_a", "key_b"]>();
        });

        it("should work with empty object", () => {
            const obj = {} as const;
            const result = objectKeysToTuple(obj);
            expectTypeOf(result).toEqualTypeOf<[never]>();
        });
    });
});
