import { cn } from "@/lib/utils";

export function DropdownMenuShortcut({
    className,
    ...props
}: React.ComponentProps<"span">) {
    return (
        <span
            data-slot="dropdown-menu-shortcut"
            className={cn(
                "ml-auto text-xs tracking-widest text-zinc-500 dark:text-zinc-400",
                className,
            )}
            {...props}
        />
    );
}
