"use client";

import { useEffect, useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { AuthSignInForm } from "@/features/auth/components/auth-signin-form";
import { AuthSignUpForm } from "@/features/auth/components/auth-signup-form";

import { useDialogState } from "@/hooks";

export function AuthSignInDialog({
    children,
    ...props
}: React.ComponentProps<typeof Dialog>) {
    const [open, onOpenChange] = useDialogState({
        ...props,
        dialogId: props.dialogId,
    });

    const [authView, setAuthView] = useState<"signin" | "signup">("signin");
    const isSigninView = authView === "signin";

    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setAuthView("signin");
            }, 300);
        }
    }, [open]);

    return (
        <Dialog {...props} open={open} onOpenChange={onOpenChange}>
            {children}
            <DialogContent
                ref={el => el?.focus()}
                className="py-6 focus-visible:ring-0 sm:max-w-md sm:py-8"
            >
                <DialogHeader className="gap-1">
                    <DialogTitle className="text-center text-xl font-bold">
                        {isSigninView ? "Welcome back!" : "Create an account"}
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        {isSigninView
                            ? "Login with your Google or Github account"
                            : "Enter your email below to create your account"}
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4">
                    {isSigninView ? (
                        <AuthSignInForm
                            onSwitchToSignup={() => setAuthView("signup")}
                            onSuccess={() => {
                                onOpenChange(false);
                            }}
                        />
                    ) : (
                        <AuthSignUpForm
                            onSwitchToSignin={() => setAuthView("signin")}
                            onSuccess={() => {
                                setAuthView("signin");
                            }}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

export function AuthSignInDialogTrigger(
    props: React.ComponentProps<typeof DialogTrigger>,
) {
    return <DialogTrigger {...props} />;
}
