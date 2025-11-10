/* eslint-disable @typescript-eslint/no-explicit-any */

declare const brand: unique symbol;

export type Brand<T, TBrand> = T & { [brand]: TBrand };

export type Split<
    TString extends string,
    TDelimiter extends string,
> = TString extends `${infer Head}${TDelimiter}${infer Tail}`
    ? [Head, ...Split<Tail, TDelimiter>]
    : [TString];

export type SplitByDelimiters<
    TString extends string,
    TDelimiters extends string[],
> = TDelimiters extends [infer D extends string, ...infer Rest extends string[]]
    ? SplitByDelimiters<
          Split<TString, D>[number] extends never
              ? TString
              : Split<TString, D>[number],
          Rest
      >
    : [TString];

type CapitalizeRest<TString extends string[]> = TString extends [
    infer First extends string,
    ...infer Rest extends string[],
]
    ? `${Lowercase<First>}${CapitalizeWords<Rest>}`
    : never;

type CapitalizeAll<TString extends string[]> = TString extends [
    infer Head extends string,
    ...infer Rest extends string[],
]
    ? `${Capitalize<Lowercase<Head>>}${CapitalizeAll<Rest>}`
    : "";

type CapitalizeWords<TString extends string[]> = TString extends [
    infer Head extends string,
    ...infer Rest extends string[],
]
    ? `${Capitalize<Lowercase<Head>>}${CapitalizeWords<Rest>}`
    : "";

export type CamelCase<
    TString extends string,
    TDelimiters extends string[] = ["_", "-"],
> = CapitalizeRest<SplitByDelimiters<TString, TDelimiters>>;

export type TitleCase<
    TString extends string,
    TDelimiters extends string[] = ["_", "-"],
> = CapitalizeAll<SplitByDelimiters<TString, TDelimiters>>;

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
