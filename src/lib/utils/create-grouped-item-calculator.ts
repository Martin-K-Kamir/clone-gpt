export type GroupedData<T> = Array<{
    key: string;
    items: T[];
}>;

export function calculateGlobalIndex<T>(
    groupedData: GroupedData<T>,
    groupIndex: number,
    itemIndex: number,
): number {
    return (
        groupedData
            .slice(0, groupIndex)
            .reduce((acc, group) => acc + group.items.length, 0) + itemIndex
    );
}

export function isNearEnd(
    globalIndex: number,
    totalItemsLength: number,
    nearEndOffset: number,
): boolean {
    return globalIndex >= totalItemsLength - nearEndOffset;
}

export function createGroupedItemCalculator<T>(
    groupedData: GroupedData<T>,
    totalItemsLength: number,
    nearEndOffset: number,
) {
    return (groupIndex: number, itemIndex: number) => {
        const globalIndex = calculateGlobalIndex(
            groupedData,
            groupIndex,
            itemIndex,
        );
        const isNearEndValue = isNearEnd(
            globalIndex,
            totalItemsLength,
            nearEndOffset,
        );

        return {
            globalIndex,
            isNearEnd: isNearEndValue,
        };
    };
}
