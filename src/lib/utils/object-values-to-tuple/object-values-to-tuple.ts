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

export type UnionToTuple<T, A extends unknown[] = []> =
    IsUnion<T> extends true
        ? UnionToTuple<Exclude<T, PopUnion<T>>, [PopUnion<T>, ...A]>
        : [T, ...A];

type MapTuple<T extends readonly unknown[], R> = {
    [K in keyof T]: R;
};

export function objectValuesToTuple<const O extends Record<string, any>>(
    object: O,
): UnionToTuple<O[keyof O]>;

export function objectValuesToTuple<const O extends Record<string, any>, R>(
    object: O,
    callback: (value: O[keyof O]) => R,
): MapTuple<UnionToTuple<O[keyof O]>, R>;

export function objectValuesToTuple(
    object: Record<string, any>,
    callback?: (value: any) => any,
): unknown {
    if (!callback) {
        return Object.values(object);
    }
    return Object.values(object).map(callback);
}
