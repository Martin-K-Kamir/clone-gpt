import { Button } from "@/components/ui/button";

import { useSessionSyncContext } from "@/features/auth/providers";

export function AuthSignOutButton({
    onClick,
    asChild,
    ...props
}: React.ComponentProps<typeof Button>) {
    const { signOutWithSync } = useSessionSyncContext();

    return (
        <Button
            onClick={e => {
                onClick?.(e);
                signOutWithSync();
            }}
            asChild={asChild}
            {...props}
        />
    );
}
