type DelimiterUnion<T extends readonly string[]> = T[number];

type CamelCaseWithDelimiter<
    S extends string,
    TDelimiter extends string,
> = S extends `${infer Head}${TDelimiter}${infer Tail}`
    ? Head extends ""
        ? Capitalize<CamelCaseWithDelimiter<Tail, TDelimiter>>
        : `${Lowercase<Head>}${Capitalize<CamelCaseWithDelimiter<Tail, TDelimiter>>}`
    : S;

type ProcessDelimiters<
    S extends string,
    TDelimiters extends readonly string[],
> = TDelimiters extends readonly []
    ? S
    : TDelimiters extends readonly [
            infer First extends string,
            ...infer Rest extends readonly string[],
        ]
      ? ProcessDelimiters<CamelCaseWithDelimiter<S, First>, Rest>
      : TDelimiters extends readonly [infer First extends string]
        ? CamelCaseWithDelimiter<S, First>
        : S extends `${infer Head}${DelimiterUnion<TDelimiters>}${infer Tail}`
          ? Head extends ""
              ? Capitalize<ProcessDelimiters<Tail, TDelimiters>>
              : `${Lowercase<Head>}${Capitalize<ProcessDelimiters<Tail, TDelimiters>>}`
          : S;

export type CamelCase<S extends string, TDelimiters extends readonly string[]> =
    ProcessDelimiters<
        Lowercase<S>,
        TDelimiters
    > extends `${infer First}${infer Rest}`
        ? `${Lowercase<First>}${Rest}`
        : ProcessDelimiters<Lowercase<S>, TDelimiters>;

export function toCamelCase<TString extends string>(
    str: TString,
): CamelCase<TString, ["_", "-"]>;

export function toCamelCase<
    TString extends string,
    const TDelimiters extends readonly string[],
>(str: TString, delimiters: TDelimiters): CamelCase<TString, TDelimiters>;

export function toCamelCase<
    TString extends string,
    TDelimiters extends readonly string[],
>(
    str: TString,
    delimiters: TDelimiters = ["_", "-"] as unknown as TDelimiters,
): CamelCase<TString, TDelimiters> {
    const escapedDelimiters = delimiters
        .map(d => d.replace(/[\]\\^-]/g, "\\$&"))
        .join("");
    const pattern = new RegExp(`[${escapedDelimiters}]+([a-zA-Z0-9])`, "g");
    return str
        .toLowerCase()
        .replace(pattern, (_, c) => c.toUpperCase()) as CamelCase<
        TString,
        TDelimiters
    >;
}
