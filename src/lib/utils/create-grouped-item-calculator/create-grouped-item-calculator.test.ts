import { describe, expect, expectTypeOf, it } from "vitest";

import {
    type GroupedData,
    calculateGlobalIndex,
    createGroupedItemCalculator,
    isNearEnd,
} from "./create-grouped-item-calculator";

type TestItem = {
    id: number;
    name: string;
};

describe("calculateGlobalIndex", () => {
    const groupedData: GroupedData<TestItem> = [
        { key: "group1", items: [{ id: 1, name: "Item 1" }] },
        {
            key: "group2",
            items: [
                { id: 2, name: "Item 2" },
                { id: 3, name: "Item 3" },
            ],
        },
        { key: "group3", items: [{ id: 4, name: "Item 4" }] },
    ];

    it("should calculate correct index for first item in first group", () => {
        expect(calculateGlobalIndex(groupedData, 0, 0)).toBe(0);
    });

    it("should calculate correct index for first item in second group", () => {
        expect(calculateGlobalIndex(groupedData, 1, 0)).toBe(1);
    });

    it("should calculate correct index for second item in second group", () => {
        expect(calculateGlobalIndex(groupedData, 1, 1)).toBe(2);
    });

    it("should calculate correct index for first item in third group", () => {
        expect(calculateGlobalIndex(groupedData, 2, 0)).toBe(3);
    });

    it("should handle empty groups", () => {
        const dataWithEmpty: GroupedData<TestItem> = [
            { key: "group1", items: [] },
            { key: "group2", items: [{ id: 1, name: "Item 1" }] },
        ];

        expect(calculateGlobalIndex(dataWithEmpty, 1, 0)).toBe(0);
    });

    it("should handle single group", () => {
        const singleGroup: GroupedData<TestItem> = [
            {
                key: "group1",
                items: [
                    { id: 1, name: "Item 1" },
                    { id: 2, name: "Item 2" },
                ],
            },
        ];

        expect(calculateGlobalIndex(singleGroup, 0, 0)).toBe(0);
        expect(calculateGlobalIndex(singleGroup, 0, 1)).toBe(1);
    });
});

describe("isNearEnd", () => {
    it("should return true when index is at the end", () => {
        expect(isNearEnd(8, 10, 2)).toBe(true);
        expect(isNearEnd(9, 10, 2)).toBe(true);
    });

    it("should return false when index is not near end", () => {
        expect(isNearEnd(5, 10, 2)).toBe(false);
        expect(isNearEnd(0, 10, 2)).toBe(false);
    });

    it("should return true when index equals total minus offset", () => {
        expect(isNearEnd(8, 10, 2)).toBe(true);
    });

    it("should return true when index exceeds threshold", () => {
        expect(isNearEnd(10, 10, 2)).toBe(true);
    });

    it("should handle zero offset", () => {
        expect(isNearEnd(9, 10, 0)).toBe(false);
        expect(isNearEnd(8, 10, 0)).toBe(false);
    });

    it("should handle large offset", () => {
        expect(isNearEnd(5, 10, 5)).toBe(true);
        expect(isNearEnd(4, 10, 5)).toBe(false);
    });
});

describe("createGroupedItemCalculator", () => {
    const groupedData: GroupedData<TestItem> = [
        {
            key: "group1",
            items: [
                { id: 1, name: "Item 1" },
                { id: 2, name: "Item 2" },
            ],
        },
        {
            key: "group2",
            items: [
                { id: 3, name: "Item 3" },
                { id: 4, name: "Item 4" },
                { id: 5, name: "Item 5" },
            ],
        },
        {
            key: "group3",
            items: [
                { id: 6, name: "Item 6" },
                { id: 7, name: "Item 7" },
            ],
        },
    ];

    const totalItemsLength = 7;
    const nearEndOffset = 2;

    it("should create calculator function", () => {
        const calculator = createGroupedItemCalculator(
            groupedData,
            totalItemsLength,
            nearEndOffset,
        );

        expect(typeof calculator).toBe("function");
    });

    it("should calculate correct global index and isNearEnd for first item", () => {
        const calculator = createGroupedItemCalculator(
            groupedData,
            totalItemsLength,
            nearEndOffset,
        );

        const result = calculator(0, 0);

        expect(result.globalIndex).toBe(0);
        expect(result.isNearEnd).toBe(false);
    });

    it("should calculate correct global index for items in middle groups", () => {
        const calculator = createGroupedItemCalculator(
            groupedData,
            totalItemsLength,
            nearEndOffset,
        );

        expect(calculator(1, 0)).toEqual({ globalIndex: 2, isNearEnd: false });
        expect(calculator(1, 1)).toEqual({ globalIndex: 3, isNearEnd: false });
        expect(calculator(1, 2)).toEqual({ globalIndex: 4, isNearEnd: false });
    });

    it("should correctly identify items near end", () => {
        const calculator = createGroupedItemCalculator(
            groupedData,
            totalItemsLength,
            nearEndOffset,
        );

        expect(calculator(2, 0)).toEqual({ globalIndex: 5, isNearEnd: true });
        expect(calculator(2, 1)).toEqual({ globalIndex: 6, isNearEnd: true });
    });

    it("should handle different nearEndOffset values", () => {
        const calculator1 = createGroupedItemCalculator(
            groupedData,
            totalItemsLength,
            1,
        );
        const calculator2 = createGroupedItemCalculator(
            groupedData,
            totalItemsLength,
            3,
        );

        expect(calculator1(2, 1)).toEqual({ globalIndex: 6, isNearEnd: true });
        expect(calculator1(2, 0)).toEqual({ globalIndex: 5, isNearEnd: false });

        expect(calculator2(1, 2)).toEqual({ globalIndex: 4, isNearEnd: true });
        expect(calculator2(1, 1)).toEqual({ globalIndex: 3, isNearEnd: false });
    });

    it("should work with empty groups", () => {
        const dataWithEmpty: GroupedData<TestItem> = [
            { key: "group1", items: [] },
            {
                key: "group2",
                items: [
                    { id: 1, name: "Item 1" },
                    { id: 2, name: "Item 2" },
                ],
            },
        ];

        const calculator = createGroupedItemCalculator(dataWithEmpty, 2, 1);

        expect(calculator(1, 0)).toEqual({ globalIndex: 0, isNearEnd: false });
        expect(calculator(1, 1)).toEqual({ globalIndex: 1, isNearEnd: true });
    });

    it("should handle single group", () => {
        const singleGroup: GroupedData<TestItem> = [
            {
                key: "group1",
                items: [
                    { id: 1, name: "Item 1" },
                    { id: 2, name: "Item 2" },
                    { id: 3, name: "Item 3" },
                ],
            },
        ];

        const calculator = createGroupedItemCalculator(singleGroup, 3, 1);

        expect(calculator(0, 0)).toEqual({ globalIndex: 0, isNearEnd: false });
        expect(calculator(0, 1)).toEqual({ globalIndex: 1, isNearEnd: false });
        expect(calculator(0, 2)).toEqual({ globalIndex: 2, isNearEnd: true });
    });

    it("should handle groups with varying item counts", () => {
        const variedData: GroupedData<TestItem> = [
            { key: "group1", items: [{ id: 1, name: "Item 1" }] },
            {
                key: "group2",
                items: [
                    { id: 2, name: "Item 2" },
                    { id: 3, name: "Item 3" },
                    { id: 4, name: "Item 4" },
                    { id: 5, name: "Item 5" },
                ],
            },
            { key: "group3", items: [{ id: 6, name: "Item 6" }] },
        ];

        const calculator = createGroupedItemCalculator(variedData, 6, 2);

        expect(calculator(0, 0)).toEqual({ globalIndex: 0, isNearEnd: false });
        expect(calculator(1, 3)).toEqual({ globalIndex: 4, isNearEnd: true });
        expect(calculator(2, 0)).toEqual({ globalIndex: 5, isNearEnd: true });
    });

    describe("type tests", () => {
        it("should preserve generic type in GroupedData", () => {
            const groupedData: GroupedData<TestItem> = [
                { key: "group1", items: [{ id: 1, name: "Item 1" }] },
            ];
            const firstItem = groupedData[0]?.items[0];
            if (firstItem) {
                expectTypeOf(firstItem).toEqualTypeOf<TestItem>();
            }
        });

        it("should return correct return type from calculator", () => {
            const groupedData: GroupedData<TestItem> = [
                { key: "group1", items: [{ id: 1, name: "Item 1" }] },
            ];
            const calculator = createGroupedItemCalculator(groupedData, 1, 0);
            const result = calculator(0, 0);
            expectTypeOf(result).toEqualTypeOf<{
                globalIndex: number;
                isNearEnd: boolean;
            }>();
        });

        it("should work with different item types", () => {
            type User = { id: string; email: string };
            const userData: GroupedData<User> = [
                { key: "group1", items: [{ id: "1", email: "test@test.com" }] },
            ];
            const calculator = createGroupedItemCalculator(userData, 1, 0);
            expectTypeOf(calculator).toBeFunction();
        });
    });
});
