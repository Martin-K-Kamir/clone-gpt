"use client";

import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

import { useEventListener } from "@/hooks";

export function DropdownMenu({
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
    useEventListener(
        "pointerdown",
        e => {
            const target = e.target as HTMLElement;
            const dropdownContent = document.querySelector(
                '[data-slot="dropdown-menu-content"][data-state="open"]',
            );

            if (dropdownContent && !dropdownContent.contains(target)) {
                e.isClickOutside = true;
            }
        },
        {
            capture: true,
        },
    );

    return <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />;
}
