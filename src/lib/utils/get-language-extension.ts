export function getLanguageExtension(value?: string) {
    if (!value) return null;

    const match = value.match(/language-(\w+)/);
    return match ? match[1] : null;
}
