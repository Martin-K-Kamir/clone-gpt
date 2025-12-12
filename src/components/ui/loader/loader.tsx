"use client";

import { type VariantProps, cva } from "class-variance-authority";
import { motion } from "framer-motion";
import * as React from "react";

import { cn } from "@/lib/utils";

const loaderVariants = cva("rounded-full bg-zinc-100", {
    variants: {
        size: {
            default: "size-3",
            sm: "size-2",
            lg: "size-4",
        },
    },
    defaultVariants: {
        size: "default",
    },
});

type LoaderVariants = VariantProps<typeof loaderVariants> &
    Omit<React.ComponentProps<typeof motion.div>, "children">;

export function Loader({ size, className, ...props }: LoaderVariants) {
    return (
        <motion.div
            className={cn(loaderVariants({ size, className }))}
            variants={{
                animate: {
                    scale: [1, 1.25, 1],
                    transition: {
                        duration: 1.25,
                        repeat: Infinity,
                        ease: "easeInOut",
                    },
                },
            }}
            animate="animate"
            {...props}
        />
    );
}
