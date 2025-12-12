import { cn } from "@/lib/utils";

export function SidebarInset({
    className,
    ...props
}: React.ComponentProps<"main">) {
    return (
        <main
            data-slot="sidebar-inset"
            className={cn(
                "bg-zinc-925 2lg:border relative flex w-full flex-col border-zinc-800",
                "2lg:peer-data-[variant=inset]:m-2 2lg:peer-data-[variant=inset]:ml-0 2lg:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2 2lg:peer-data-[variant=inset]:rounded-lg",
                className,
            )}
            {...props}
        />
    );
}
