"use client";

import { Fragment, useState } from "react";

import { cn } from "@/lib/utils";

type TextSwitchProps<TValues extends string> = {
    value: TValues;
    values: TValues[];
    separator?: string;
    classNameItem?: string;
    classNameActive?: string;
    classNameInactive?: string;
    classNameSeparator?: string;
    controlled?: boolean;
    onChange?: (value: TValues) => void;
} & Omit<React.ComponentProps<"span">, "children" | "onChange">;

export function TextSwitch<TValues extends string>({
    value,
    onChange,
    values,
    className,
    classNameItem,
    classNameActive,
    classNameInactive,
    classNameSeparator,
    separator = "|",
    controlled = false,
    ...props
}: TextSwitchProps<TValues>) {
    const [activeValue, setActiveValue] = useState<TValues>(value);

    function handleChange(v: TValues) {
        if (controlled) {
            return;
        }
        const nextIndex = values.indexOf(v) + 1;
        const nextValue = values[nextIndex % values.length];
        setActiveValue(nextValue);
        onChange?.(nextValue);
    }

    return (
        <span
            className={cn("flex items-center gap-1.5", className)}
            role="group"
            aria-label={`Select ${values.join(", ")}`}
            aria-roledescription="Text switch"
            {...props}
            onClick={() => handleChange(activeValue)}
        >
            {values.map((v, index) => {
                const isLast = index === values.length - 1;

                return (
                    <Fragment key={v}>
                        <span
                            aria-current={v === value}
                            className={cn(
                                v === value
                                    ? "font-semibold text-gray-50"
                                    : "text-gray-400",
                                v === value && classNameActive,
                                v !== value && classNameInactive,
                                classNameItem,
                            )}
                        >
                            {v}
                        </span>
                        {!isLast ? (
                            <span
                                className={cn(
                                    "text-gray-400",
                                    classNameSeparator,
                                )}
                            >
                                {separator}
                            </span>
                        ) : null}
                    </Fragment>
                );
            })}
        </span>
    );
}
