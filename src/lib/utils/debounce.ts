type DebounceOptions = {
    leading?: boolean;
    trailing?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    options: DebounceOptions = { leading: false, trailing: true },
): (...args: Parameters<T>) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let lastCallTime: number | null = null;
    let calledLeading = false;

    return function (...args: Parameters<T>) {
        const now = Date.now();

        if (!lastCallTime) lastCallTime = now;

        const callNow = options.leading && !calledLeading;

        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        if (callNow) {
            func(...args);
            calledLeading = true;
            lastCallTime = now;
        }

        timeoutId = setTimeout(() => {
            if (options.trailing && (!options.leading || calledLeading)) {
                func(...args);
            }
            timeoutId = null;
            calledLeading = false;
            lastCallTime = null;
        }, wait);
    };
}
