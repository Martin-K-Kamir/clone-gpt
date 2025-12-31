import { type CamelCase, toCamelCase } from "@/lib/utils/to-camel-case";

export type TitleCase<S extends string, TDelimiters extends readonly string[]> =
    CamelCase<S, TDelimiters> extends `${infer First}${infer Rest}`
        ? `${Capitalize<First>}${Rest}`
        : Capitalize<CamelCase<S, TDelimiters>>;

export function toTitleCase<TString extends string>(
    str: TString,
): TitleCase<TString, ["_", "-"]>;

export function toTitleCase<
    TString extends string,
    const TDelimiters extends readonly string[],
>(str: TString, delimiters: TDelimiters): TitleCase<TString, TDelimiters>;

export function toTitleCase<
    TString extends string,
    TDelimiters extends readonly string[],
>(
    str: TString,
    delimiters: TDelimiters = ["_", "-"] as unknown as TDelimiters,
): TitleCase<TString, TDelimiters> {
    const camelCaseStr = toCamelCase(str, delimiters);

    return (camelCaseStr.charAt(0).toUpperCase() +
        camelCaseStr.slice(1)) as TitleCase<TString, TDelimiters>;
}
