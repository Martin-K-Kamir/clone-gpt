import { IconSearch } from "@tabler/icons-react";
import { Command as CommandPrimitive } from "cmdk";

import { DialogClose } from "@/components/ui/dialog";

import { cn } from "@/lib/utils";

type SearchInputProps = {
    showCloseButton?: boolean;
    showBorder?: boolean;
} & React.ComponentProps<typeof CommandPrimitive.Input>;

export function SearchInput({
    className,
    showCloseButton = false,
    ...props
}: SearchInputProps) {
    return (
        <div
            data-slot="search-input-wrapper"
            className={cn(
                "flex h-14 items-center gap-2 border-zinc-700 px-5 group-has-[[cmdk-list-sizer]:not(:empty)]/search:border-b max-lg:border-b",
            )}
        >
            <IconSearch className="size-4 shrink-0 opacity-50" />
            <CommandPrimitive.Input
                data-slot="search-input"
                className={cn(
                    "outline-hidden flex h-10 w-full rounded-md bg-transparent py-4 text-base placeholder:text-zinc-400/95 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
                    className,
                )}
                {...props}
            />
            {showCloseButton && <DialogClose className="ml-auto" />}
        </div>
    );
}
