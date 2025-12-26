"use client";

import { IconX } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";

import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

import { useElementDimensions } from "@/hooks";

export type ChatComposerInfoProps = {
    open?: boolean;
    onClose?: () => void;
    children: React.ReactNode;
} & Omit<React.ComponentProps<typeof motion.div>, "children">;

export function ChatComposerInfo({
    open,
    className,
    children,
    onClose,
    ...props
}: ChatComposerInfoProps) {
    const { updateDimensions, removeDimensions } = useElementDimensions({
        name: "chat-composer-info",
        updateOnResize: true,
    });

    return (
        <>
            <AnimatePresence>
                {open && (
                    <motion.div
                        ref={updateDimensions}
                        initial={{ y: "0%" }}
                        animate={{ y: "calc(-100% - 12px)" }}
                        exit={{ y: "0%" }}
                        transition={{
                            duration: 0.3,
                            ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        className={cn(
                            "pl-4.5 absolute left-0 top-0 flex w-full items-center justify-between rounded-3xl bg-zinc-800 py-4 pr-3",
                            className,
                        )}
                        {...props}
                    >
                        {children}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-full hover:bg-zinc-700"
                            onClick={onClose}
                        >
                            <span className="sr-only">
                                Close rate limit info
                            </span>
                            <IconX />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
            {!open && (
                <div
                    ref={el => void (!el && removeDimensions())}
                    className="sr-only"
                />
            )}
        </>
    );
}
