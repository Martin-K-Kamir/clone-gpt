import { capitalize } from "./capitalize";

export function getFirstName(fullName?: string | null): string {
    if (!fullName || typeof fullName !== "string") {
        return "";
    }

    const name = fullName.trim();
    if (!name) return "";

    const delimiters = /[\s\-_\.]+/;
    const parts = name.split(delimiters);

    if (parts.length > 1 && parts[0]) {
        return capitalize(parts[0].toLowerCase());
    }

    const camelCaseMatch = name.match(/^[a-z]+/);
    if (camelCaseMatch) {
        return capitalize(camelCaseMatch[0].toLowerCase());
    }

    const pascalCaseMatch = name.match(/^[A-Z][a-z]*/);
    if (pascalCaseMatch) {
        return capitalize(pascalCaseMatch[0].toLowerCase());
    }

    return capitalize(name.toLowerCase());
}
