// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => void>(
    func: T,
    limit: number,
): T {
    let inThrottle = false;
    let lastArgs: Parameters<T> | null = null;

    const throttled = function (
        this: ThisParameterType<T>,
        ...args: Parameters<T>
    ) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;

            setTimeout(() => {
                inThrottle = false;
                if (lastArgs) {
                    func.apply(this, lastArgs);
                    lastArgs = null;
                }
            }, limit);
        } else {
            lastArgs = args;
        }
    };

    return throttled as T;
}
