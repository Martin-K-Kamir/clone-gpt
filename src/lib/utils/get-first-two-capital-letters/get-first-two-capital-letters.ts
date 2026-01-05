export function getFirstTwoCapitalLetters(str?: string | null) {
    if (!str) return null;

    const words = str.trim().split(/\s+/);
    const initials = words
        .map(word => word[0])
        .filter(Boolean)
        .slice(0, 2)
        .map(letter => letter.toUpperCase())
        .join("");

    return initials || null;
}
