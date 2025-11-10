type ExtractPlaceholders<T extends string> =
    T extends `${string}{${infer Key}}${infer Rest}`
        ? Key | ExtractPlaceholders<Rest>
        : never;

type TemplateReplacements<T extends string> = {
    [K in ExtractPlaceholders<T>]: string | number;
};

export function formatTemplate<T extends string>(
    template: T,
    replacements: TemplateReplacements<T>,
): string {
    return template.replace(/\{(\w+)\}/g, (_, key) =>
        String(replacements[key as keyof typeof replacements] ?? `{${key}}`),
    );
}
