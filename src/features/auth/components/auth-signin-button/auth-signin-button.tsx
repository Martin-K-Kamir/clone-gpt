"use client";

import { IconBrandGithub, IconBrandGoogleFilled } from "@tabler/icons-react";
import { useEffect, useTransition } from "react";

import { Button } from "@/components/ui/button";

import { AUTH_PROVIDER } from "@/features/auth/lib/constants";
import type { AuthExternalProvider } from "@/features/auth/lib/types";
import { signIn } from "@/features/auth/services/actions";

type AuthSignInButtonProps = {
    provider: AuthExternalProvider;
    onSigningInChange?: (isSigningIn: boolean) => void;
} & React.ComponentProps<typeof Button>;

const providerIconMap = {
    [AUTH_PROVIDER.GOOGLE]: <IconBrandGoogleFilled />,
    [AUTH_PROVIDER.GITHUB]: <IconBrandGithub />,
} as const;

export function AuthSignInButton({
    provider,
    disabled,
    children,
    variant = "outline",
    type = "button",
    onClick,
    onSigningInChange,
    ...props
}: AuthSignInButtonProps) {
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        onSigningInChange?.(isPending);
    }, [isPending, onSigningInChange]);

    return (
        <Button
            variant={variant}
            type={type}
            onClick={e => {
                onClick?.(e);
                startTransition(() => {
                    signIn({ provider });
                });
            }}
            isLoading={isPending}
            disabled={disabled || isPending}
            {...props}
        >
            {providerIconMap[provider]}
            {children}
        </Button>
    );
}
