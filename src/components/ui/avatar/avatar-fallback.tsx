import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/lib/utils";

export function AvatarFallback({
    className,
    ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
    return (
        <AvatarPrimitive.Fallback
            data-slot="avatar-fallback"
            className={cn(
                "flex size-full items-center justify-center rounded-full bg-indigo-800",
                className,
            )}
            {...props}
        />
    );
}
