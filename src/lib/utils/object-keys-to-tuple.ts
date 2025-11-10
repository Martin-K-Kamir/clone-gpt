import { UnionToTuple } from "@/lib/types";

export function objectKeysToTuple<TKey extends string>(
    object: Record<TKey, unknown>,
): UnionToTuple<TKey>;
export function objectKeysToTuple<TKey extends string, TReturn extends string>(
    object: Record<TKey, unknown>,
    callback: (key: TKey) => TReturn,
): UnionToTuple<TReturn>;
export function objectKeysToTuple<TKey extends string, TReturn extends string>(
    object: Record<TKey, unknown>,
    callback?: (key: TKey) => TReturn,
): UnionToTuple<TKey> | UnionToTuple<TReturn> {
    if (!callback) {
        return Object.keys(object) as UnionToTuple<TKey>;
    }

    return Object.keys(object).map(
        (key): TReturn => callback(key as TKey),
    ) as UnionToTuple<TReturn>;
}
