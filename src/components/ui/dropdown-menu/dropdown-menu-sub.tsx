import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

export function DropdownMenuSub({
    ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Sub>) {
    return (
        <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
    );
}
