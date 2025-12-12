"use client";

import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { SHEET_SIDE } from "./constants";
import { useSheetContext } from "./sheet";
import { SheetClose } from "./sheet-close";
import { SheetOverlay } from "./sheet-overlay";
import { SheetPortal } from "./sheet-portal";
import type { SheetSide } from "./types";

type SheetContentProps = {
    side?: SheetSide;
} & React.ComponentProps<"div">;

export function SheetContent({
    className,
    children,
    side = SHEET_SIDE.RIGHT,
    ...props
}: SheetContentProps) {
    const { view } = useSheetContext();

    return (
        <SheetPortal>
            <SheetOverlay data-state={view} />
            <div
                data-slot="sheet-content"
                data-state={view}
                className={cn(
                    "data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 border-zinc-800 bg-zinc-950 shadow-lg transition data-[state=closed]:duration-300 data-[state=open]:duration-500",
                    side === "right" &&
                        "inset-y-0 right-0 h-full w-3/4 border-l transition-[right] data-[state=closed]:right-[-100%] sm:max-w-sm",
                    side === "left" &&
                        "inset-y-0 left-0 h-full w-3/4 border-r transition-[left] data-[state=closed]:left-[-100%] sm:max-w-sm",
                    side === "top" &&
                        "inset-x-0 top-0 h-auto border-b transition-[top] data-[state=closed]:top-[-100%]",
                    side === "bottom" &&
                        "inset-x-0 bottom-0 h-auto border-t transition-[bottom] data-[state=closed]:bottom-[-100%]",
                    className,
                )}
                {...props}
            >
                {children}
                <SheetClose
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4 size-6 rounded-full text-zinc-400 hover:text-zinc-100"
                >
                    <XIcon className="size-4" />
                    <span className="sr-only">Close</span>
                </SheetClose>
            </div>
        </SheetPortal>
    );
}
