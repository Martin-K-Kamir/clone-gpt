type Ref<T> = React.RefCallback<T> | React.MutableRefObject<T> | null;

export function mergeRefs<T>(...refs: Ref<T>[]) {
    return (value: T | null) => {
        refs.forEach(ref => {
            if (typeof ref === "function") {
                ref(value);
            } else if (ref != null) {
                (ref as React.MutableRefObject<T | null>).current = value;
            }
        });
    };
}
