"use client";

import { motion } from "framer-motion";
import * as React from "react";

import { cn } from "@/lib/utils";

type TextShimmerVariants = Omit<
    React.ComponentProps<typeof motion.div>,
    "children"
> & {
    classNameParagraph?: string;
    children: React.ReactNode;
};

export function TextShimmer({
    children,
    classNameParagraph,
    ...props
}: TextShimmerVariants) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: -1 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{
                duration: 0.4,
                ease: "easeOut",
            }}
            {...props}
        >
            <p
                className={cn(
                    "inline-block w-fit animate-[animate-shimmer_2.5s_linear_infinite] bg-[linear-gradient(90deg,theme(colors.zinc.500)_0%,theme(colors.zinc.500)_40%,white_60%,theme(colors.zinc.500)_80%,theme(colors.zinc.500)_100%)] bg-[length:200%_100%] bg-clip-text text-sm leading-none text-transparent",
                    classNameParagraph,
                )}
            >
                {children}
            </p>
        </motion.div>
    );
}
