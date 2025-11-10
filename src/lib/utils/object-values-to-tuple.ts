import { UnionToTuple } from "@/lib/types";

export function objectValuesToTuple<TValue>(
    object: Record<string, TValue>,
): UnionToTuple<TValue>;
export function objectValuesToTuple<TValue, TReturn>(
    object: Record<string, TValue>,
    callback: (value: TValue) => TReturn,
): UnionToTuple<TReturn>;
export function objectValuesToTuple<TValue, TReturn>(
    object: Record<string, TValue>,
    callback?: (value: TValue) => TReturn,
): UnionToTuple<TValue> | UnionToTuple<TReturn> {
    if (!callback) {
        return Object.values(object) as UnionToTuple<TValue>;
    }

    return Object.values(object).map(callback) as UnionToTuple<TReturn>;
}
