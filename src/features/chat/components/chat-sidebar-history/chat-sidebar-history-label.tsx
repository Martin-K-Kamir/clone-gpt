import { motion } from "framer-motion";

import { SidebarGroupLabel } from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";

type ChatSidebarHistoryLabelProps = {
    animate?: boolean;
    children: React.ReactNode;
} & React.ComponentProps<typeof motion.li>;

export function ChatSidebarHistoryLabel({
    children,
    className,
    animate,
    ...props
}: ChatSidebarHistoryLabelProps) {
    const variants = {
        hidden: { opacity: 0, y: -15 },
        visible: { opacity: 1, y: 0 },
    };

    const transition = {
        duration: 0.3,
        ease: "easeOut",
    };

    return (
        <motion.li
            className={cn(
                "not-first:mt-4 sticky top-0 list-none bg-zinc-950",
                className,
            )}
            layout
            variants={variants}
            initial={animate ? "hidden" : undefined}
            animate={animate ? "visible" : undefined}
            exit={animate ? "hidden" : undefined}
            transition={transition}
            {...props}
        >
            <SidebarGroupLabel>{children}</SidebarGroupLabel>
        </motion.li>
    );
}
