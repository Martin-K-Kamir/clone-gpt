export function extractQuerySnippet(
    content: string,
    query: string,
    maxLength = 100,
): string {
    if (!content) return "";

    const normalizedContent = content.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    const queryIndex = normalizedContent.indexOf(normalizedQuery);

    if (queryIndex === -1) return content.slice(0, maxLength);

    if (queryIndex < 10) {
        return content.slice(0, Math.min(maxLength, content.length));
    }

    if (queryIndex + normalizedQuery.length >= content.length - 20) {
        const startIndex = Math.max(0, content.length - maxLength);
        return "... " + content.slice(startIndex);
    }

    const halfLength = Math.floor((maxLength - normalizedQuery.length) / 2);
    const snippetStart = Math.max(0, queryIndex - halfLength);
    const snippetEnd = Math.min(
        content.length,
        queryIndex + normalizedQuery.length + halfLength,
    );

    return "... " + content.slice(snippetStart, snippetEnd) + " ...";
}
