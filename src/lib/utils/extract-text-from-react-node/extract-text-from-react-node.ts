export function extractTextFromReactNode(child: React.ReactNode): string {
    if (typeof child === "string") return child;
    if (typeof child === "number") return String(child);
    if (Array.isArray(child))
        return child.map(extractTextFromReactNode).join("");
    if (child && typeof child === "object" && "props" in child && child.props) {
        return extractTextFromReactNode(
            (child as { props: { children: React.ReactNode } }).props.children,
        );
    }
    return "";
}
