export function isReactElement(
    children: React.ReactNode,
): children is React.ReactElement {
    return (
        children !== null &&
        children !== undefined &&
        typeof children === "object" &&
        "type" in children
    );
}
