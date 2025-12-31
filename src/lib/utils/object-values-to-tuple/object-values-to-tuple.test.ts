import { describe, expect, expectTypeOf, it } from "vitest";

import { objectValuesToTuple } from "./object-values-to-tuple";

describe("objectValuesToTuple", () => {
    it("should return values as tuple without callback", () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = objectValuesToTuple(obj);

        expect(result).toEqual([1, 2, 3]);
    });

    it("should return values in correct order", () => {
        const obj = { z: "last", a: "first", m: "middle" };
        const result = objectValuesToTuple(obj);

        expect(result).toEqual(["last", "first", "middle"]);
    });

    it("should handle empty object", () => {
        const obj = {};
        const result = objectValuesToTuple(obj);

        expect(result).toEqual([]);
    });

    it("should handle single value", () => {
        const obj = { key: "value" };
        const result = objectValuesToTuple(obj);

        expect(result).toEqual(["value"]);
    });

    it("should transform values with callback", () => {
        const obj = { a: 1, b: 2 };
        const result = objectValuesToTuple(obj, value => value * 2);

        expect(result).toEqual([2, 4]);
    });

    it("should handle callback that converts to string", () => {
        const obj = { a: 1, b: 2, c: 3 };
        const result = objectValuesToTuple(obj, value => String(value));

        expect(result).toEqual(["1", "2", "3"]);
    });

    it("should handle callback that processes objects", () => {
        const obj = {
            user1: { name: "John", age: 30 },
            user2: { name: "Jane", age: 25 },
        };
        const result = objectValuesToTuple(obj, user => user.name);

        expect(result).toEqual(["John", "Jane"]);
    });

    it("should preserve value order with callback", () => {
        const obj = { first: 10, second: 20, third: 30 };
        const result = objectValuesToTuple(obj, value => value * 2);

        expect(result).toEqual([20, 40, 60]);
    });

    it("should handle string values", () => {
        const obj = { key1: "value1", key2: "value2" };
        const result = objectValuesToTuple(obj);

        expect(result).toEqual(["value1", "value2"]);
    });

    it("should handle boolean values", () => {
        const obj = { a: true, b: false, c: true };
        const result = objectValuesToTuple(obj);

        expect(result).toEqual([true, false, true]);
    });

    it("should handle null and undefined values", () => {
        const obj = { a: null, b: undefined, c: "value" };
        const result = objectValuesToTuple(obj);

        expect(result).toEqual([null, undefined, "value"]);
    });

    it("should handle array values", () => {
        const obj = { a: [1, 2], b: [3, 4] };
        const result = objectValuesToTuple(obj);

        expect(result).toEqual([
            [1, 2],
            [3, 4],
        ]);
    });

    it("should handle callback with complex transformation", () => {
        const obj = { a: 5, b: 10, c: 15 };
        const result = objectValuesToTuple(obj, value => ({
            original: value,
            doubled: value * 2,
        }));

        expect(result).toEqual([
            { original: 5, doubled: 10 },
            { original: 10, doubled: 20 },
            { original: 15, doubled: 30 },
        ]);
    });

    describe("type tests", () => {
        it("should return tuple of values without callback", () => {
            const obj = { a: 1, b: 2, c: 3 } as const;
            const result = objectValuesToTuple(obj);
            expectTypeOf(result).toEqualTypeOf<[1, 2, 3]>();
        });

        it("should return tuple of transformed values with callback", () => {
            const obj = { a: 1, b: 2 } as const;
            const result = objectValuesToTuple(obj, val => val * 2);
            expectTypeOf(result).toEqualTypeOf<[number, number]>();
        });

        it("should work with empty object", () => {
            const obj = {} as const;
            const result = objectValuesToTuple(obj);
            expectTypeOf(result).toEqualTypeOf<[never]>();
        });
    });
});
