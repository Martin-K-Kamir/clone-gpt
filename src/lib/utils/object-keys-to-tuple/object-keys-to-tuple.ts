type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
    k: infer I,
) => void
    ? I
    : never;

type UnionToOvlds<U> = UnionToIntersection<
    U extends any ? (f: U) => void : never
>;

type PopUnion<U> = UnionToOvlds<U> extends (a: infer A) => void ? A : never;

type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;

type UnionToTuple<T, A extends unknown[] = []> =
    IsUnion<T> extends true
        ? UnionToTuple<Exclude<T, PopUnion<T>>, [PopUnion<T>, ...A]>
        : [T, ...A];

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
