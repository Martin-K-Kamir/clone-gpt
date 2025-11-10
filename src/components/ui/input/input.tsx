"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";

type InputProps = (
    | {
          placeholderAnimation?: false;
          placeholders?: never;
          switchInterval?: never;
          runAnimation?: never;
          switchDuration?: never;
          randomize?: never;
      }
    | {
          placeholderAnimation: true;
          placeholders: readonly string[];
          switchInterval?: number;
          switchDuration?: number;
          runAnimation?: boolean;
          randomize?: boolean;
      }
) & {
    isLoading?: boolean;
    classNameSkeleton?: string;
    classNameInputWrapper?: string;
    classNamePlaceholder?: string;
    classNamePlaceholderWrapper?: string;
} & React.ComponentProps<"input">;

export function Input({
    className,
    type,
    placeholderAnimation,
    placeholders,
    switchInterval,
    switchDuration,
    runAnimation,
    randomize,
    isLoading,
    placeholder,
    disabled,
    classNameSkeleton,
    classNamePlaceholder,
    classNamePlaceholderWrapper,
    classNameInputWrapper,
    ...props
}: InputProps) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (
            !placeholderAnimation ||
            !placeholders ||
            !runAnimation ||
            props.value
        )
            return;

        const interval = setInterval(() => {
            if (randomize) {
                let newIndex;
                do {
                    newIndex = Math.floor(Math.random() * placeholders.length);
                } while (newIndex === index && placeholders.length > 1);
                setIndex(newIndex);
            } else {
                setIndex(prev => (prev + 1) % placeholders.length);
            }
        }, switchInterval ?? 6_000);
        return () => clearInterval(interval);
    }, [
        placeholderAnimation,
        placeholders,
        switchInterval,
        runAnimation,
        randomize,
        index,
        props.value,
    ]);

    const input = (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "shadow-xs 2lg:h-9 flex h-10 w-full min-w-0 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1 text-base outline-none transition-[color,box-shadow] selection:bg-zinc-50 selection:text-zinc-900 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-zinc-50 placeholder:text-zinc-400 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                "focus-visible:border-zinc-100 focus-visible:ring-1 focus-visible:ring-zinc-100",
                "aria-invalid:ring-rose-700 aria-invalid:border-rose-700",
                className,
            )}
            placeholder={isLoading || placeholderAnimation ? "" : placeholder}
            disabled={isLoading || disabled}
            {...props}
        />
    );

    if (placeholderAnimation && !isLoading) {
        return (
            <div className={cn("relative", classNameInputWrapper)}>
                {input}
                {!props.value && (
                    <div
                        className={cn(
                            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400",
                            classNamePlaceholderWrapper,
                        )}
                    >
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={index}
                                initial={{
                                    y: 15,
                                    opacity: 0,
                                }}
                                animate={{
                                    y: 0,
                                    opacity: 1,
                                }}
                                exit={{
                                    y: -15,
                                    opacity: 0,
                                }}
                                transition={{
                                    duration: switchDuration ?? 0.35,
                                }}
                                className={cn("block", classNamePlaceholder)}
                            >
                                {placeholders[index]}
                            </motion.span>
                        </AnimatePresence>
                    </div>
                )}
            </div>
        );
    }

    if (isLoading) {
        return (
            <div
                className={cn(
                    "relative grid items-center",
                    classNameInputWrapper,
                )}
            >
                {input}
                <Skeleton
                    className={cn(
                        "absolute left-3 h-3.5 w-2/4 bg-zinc-700",
                        classNameSkeleton,
                    )}
                />
            </div>
        );
    }

    return input;
}
