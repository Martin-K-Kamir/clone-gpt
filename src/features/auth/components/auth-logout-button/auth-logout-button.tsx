import { Button } from "@/components/ui/button";

import { useSessionSync } from "@/features/auth/providers";

export function AuthLogoutButton({
    onClick,
    asChild,
    ...props
}: React.ComponentProps<typeof Button>) {
    const { signOutWithSync } = useSessionSync();

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
