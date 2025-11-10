// Message formatting utility for ICU placeholders
export function formatMessage(
    message: string,
    placeholders?: Record<string, string | number>,
): string {
    if (!placeholders) return message;

    let result = message;

    const pluralRegex = /{([^,}]+), plural, ([^}]+)}/g;
    result = result.replace(pluralRegex, (_match, key, options) => {
        if (!placeholders || !(key in placeholders)) return "";

        const count = Number(placeholders[key]);

        const optionsStr = options.trim();
        const optionMatches = [
            ...optionsStr.matchAll(/(?:=(\d+)|one|other) \[([^\]]+)\]/g),
        ];

        const exactMatch = optionMatches.find(
            m => m[1] !== undefined && Number(m[1]) === count,
        );
        if (exactMatch) return exactMatch[2];

        if (count === 1) {
            const oneMatch = optionMatches.find(m => m[0].startsWith("one"));
            if (oneMatch) return oneMatch[2];
        }

        const otherMatch = optionMatches.find(m => m[0].startsWith("other"));
        if (otherMatch) {
            return otherMatch[2].replace("#", count.toString());
        }

        return "";
    });

    Object.entries(placeholders).forEach(([key, value]) => {
        result = result.replace(new RegExp(`{${key}}`, "g"), String(value));
    });

    return result;
}
