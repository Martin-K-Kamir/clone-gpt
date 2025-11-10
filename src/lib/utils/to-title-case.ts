import type { TitleCase } from "@/lib/types";

import { toCamelCase } from "./to-camel-case";

export function toTitleCase<
    TString extends string,
    TDelimiters extends string[],
>(
    str: TString,
    delimiters: TDelimiters = ["_", "-"] as TDelimiters,
): TitleCase<TString, TDelimiters> {
    const camelCaseStr = toCamelCase(str, delimiters);

    return (camelCaseStr.charAt(0).toUpperCase() +
        camelCaseStr.slice(1)) as TitleCase<TString, TDelimiters>;
}
