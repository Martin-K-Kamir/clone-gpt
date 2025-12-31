import {
    afterEach,
    beforeEach,
    describe,
    expect,
    expectTypeOf,
    it,
    vi,
} from "vitest";

import { throttle } from "./throttle";

describe("throttle", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it("should call function immediately on first call", () => {
        const func = vi.fn();
        const throttled = throttle(func, 100);

        throttled();

        expect(func).toHaveBeenCalledOnce();
    });

    it("should not call function again within throttle limit", () => {
        const func = vi.fn();
        const throttled = throttle(func, 100);

        throttled();
        throttled();
        throttled();

        expect(func).toHaveBeenCalledOnce();
    });

    it("should call function again after throttle limit", () => {
        const func = vi.fn();
        const throttled = throttle(func, 100);

        throttled();
        expect(func).toHaveBeenCalledTimes(1);

        vi.advanceTimersByTime(100);

        expect(func).toHaveBeenCalledTimes(1);
    });

    it("should call function with last arguments after throttle limit", () => {
        const func = vi.fn();
        const throttled = throttle(func, 100);

        throttled("first");
        throttled("second");
        throttled("third");

        expect(func).toHaveBeenCalledTimes(1);
        expect(func).toHaveBeenCalledWith("first");

        vi.advanceTimersByTime(100);

        expect(func).toHaveBeenCalledTimes(2);
        expect(func).toHaveBeenCalledWith("third");
    });

    it("should handle multiple calls with different arguments", () => {
        const func = vi.fn();
        const throttled = throttle(func, 100);

        throttled("arg1");
        throttled("arg2");
        vi.advanceTimersByTime(100);
        throttled("arg3");
        throttled("arg4");
        vi.advanceTimersByTime(100);

        expect(func).toHaveBeenCalledTimes(4);
        expect(func).toHaveBeenNthCalledWith(1, "arg1");
        expect(func).toHaveBeenNthCalledWith(2, "arg2");
        expect(func).toHaveBeenNthCalledWith(3, "arg3");
        expect(func).toHaveBeenNthCalledWith(4, "arg4");
    });

    it("should preserve function context", () => {
        const obj = {
            value: 0,
            increment() {
                this.value++;
            },
        };

        const throttled = throttle(obj.increment.bind(obj), 100);
        throttled();
        expect(obj.value).toBe(1);
    });

    it("should handle zero throttle limit", () => {
        const func = vi.fn();
        const throttled = throttle(func, 0);

        throttled();
        throttled();

        expect(func).toHaveBeenCalledTimes(1);
    });

    it("should handle function with multiple arguments", () => {
        const func = vi.fn();
        const throttled = throttle(func, 100);

        throttled("arg1", "arg2", "arg3");
        throttled("arg4", "arg5", "arg6");

        expect(func).toHaveBeenCalledTimes(1);
        expect(func).toHaveBeenCalledWith("arg1", "arg2", "arg3");

        vi.advanceTimersByTime(100);

        expect(func).toHaveBeenCalledTimes(2);
        expect(func).toHaveBeenCalledWith("arg4", "arg5", "arg6");
    });

    describe("type tests", () => {
        it("should preserve function type", () => {
            const func = (a: string, b: number) => a + b;
            const throttled = throttle(func, 100);
            expectTypeOf(throttled).toEqualTypeOf<typeof func>();
        });

        it("should preserve function with no arguments", () => {
            const func = () => void 0;
            const throttled = throttle(func, 100);
            expectTypeOf(throttled).toEqualTypeOf<typeof func>();
        });

        it("should preserve function with multiple parameters", () => {
            const func = (a: string, b: number, c: boolean) => `${a}-${b}-${c}`;
            const throttled = throttle(func, 100);
            expectTypeOf(throttled).toEqualTypeOf<typeof func>();
        });
    });
});
