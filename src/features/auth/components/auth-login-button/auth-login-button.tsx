import { IconBrandGithub, IconBrandGoogleFilled } from "@tabler/icons-react";
import { useEffect, useTransition } from "react";

import { Button } from "@/components/ui/button";

import { AUTH_PROVIDER } from "@/features/auth/lib/constants";
import type { AuthExternalProvider } from "@/features/auth/lib/types";
import { signIn } from "@/features/auth/services/actions";

type AuthLoginButtonProps = {
    provider: AuthExternalProvider;
    onLoggingInChange?: (isLoggingIn: boolean) => void;
} & React.ComponentProps<typeof Button>;

const providerIconMap = {
    [AUTH_PROVIDER.GOOGLE]: <IconBrandGoogleFilled />,
    [AUTH_PROVIDER.GITHUB]: <IconBrandGithub />,
} as const;

export function AuthLoginButton({
    provider,
    disabled,
    children,
    variant = "outline",
    type = "button",
    onClick,
    onLoggingInChange,
    ...props
}: AuthLoginButtonProps) {
    const [isLoggingIn, startTransition] = useTransition();

    useEffect(() => {
        onLoggingInChange?.(isLoggingIn);
    }, [isLoggingIn, onLoggingInChange]);

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
            isLoading={isLoggingIn}
            disabled={disabled || isLoggingIn}
            {...props}
        >
            {providerIconMap[provider]}
            {children}
        </Button>
    );
}
