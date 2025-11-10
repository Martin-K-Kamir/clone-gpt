import type { CamelCase } from "@/lib/types";

export function toCamelCase<
    TString extends string,
    TDelimiters extends string[],
>(
    str: TString,
    delimiters: TDelimiters = ["_", "-"] as TDelimiters,
): CamelCase<TString, TDelimiters> {
    const pattern = new RegExp(`[${delimiters.join("")}]+([a-zA-Z0-9])`, "g");
    return str
        .toLowerCase()
        .replace(pattern, (_, c) => c.toUpperCase()) as CamelCase<
        TString,
        TDelimiters
    >;
}
