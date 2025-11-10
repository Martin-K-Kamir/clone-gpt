import { cva } from "class-variance-authority";

export const buttonVariants = cva(
    "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-zinc-950 focus-visible:ring-blue-500 focus-visible:ring-2",
    {
        variants: {
            variant: {
                default:
                    "bg-zinc-50 text-zinc-900 hover:brightness-85 focus-visible:brightness-85",
                destructive:
                    "bg-rose-700 text-zinc-50 hover:bg-rose-600 focus-visible:ring-zinc-50 focus-visible:bg-rose-600",
                outline:
                    "border hover:text-zinc-50 bg-zinc-700/30 border-zinc-700 hover:bg-zinc-700/60",
                secondary: "bg-zinc-700 hover:bg-zinc-600",
                tertiary: "bg-zinc-900 hover:bg-zinc-800",
                ghost: "hover:bg-zinc-800 hover:text-zinc-50 focus-visible:bg-zinc-800 data-[state=open]:bg-zinc-800",
                blurred: "backdrop-blur-sm hover:backdrop-brightness-120",
                "ghost-blurred":
                    "hover:backdrop-blur-sm hover:text-zinc-50 focus-visible:backdrop-blur-sm data-[state=open]:backdrop-blur-sm",
                link: "text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50",
            },
            size: {
                none: "",
                default:
                    "h-9 px-4 py-2 has-[>svg:not([data-slot='loading-icon'])]:px-3",
                sm: "h-8 rounded-lg gap-1.5 px-3 has-[>svg:not([data-slot='loading-icon'])]:px-2.5",
                xs: "h-7 rounded-lg gap-1.5 px-2.5 has-[>svg:not([data-slot='loading-icon'])]:px-2 text-xs",
                lg: "h-10 rounded-lg px-6 has-[>svg:not([data-slot='loading-icon'])]:px-4",
                icon: "size-9",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    },
);
