"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormSeparator,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuthLoginButton } from "@/features/auth/components/auth-login-button";
import { AUTH_PROVIDER } from "@/features/auth/lib/constants";
import { signupSchema } from "@/features/auth/lib/schemas";
import { signUp } from "@/features/auth/services/actions";

type AuthSignupFormProps = {
    switchToSignin?: boolean;
    onSwitchToSignin?: () => void;
    onSubmit?: (values: z.infer<typeof signupSchema>) => void;
    onSuccess?: (values: z.infer<typeof signupSchema>) => void;
    onError?: (error: Error) => void;
};

export function AuthSignupForm({
    switchToSignin,
    onSwitchToSignin,
    onSubmit,
    onSuccess,
    onError,
}: AuthSignupFormProps) {
    const router = useRouter();
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<z.infer<typeof signupSchema>>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });

    const canLinkToSignin = typeof onSwitchToSignin === "undefined";

    const passwordError = [
        form.formState.errors.password?.message,
        form.formState.errors.confirmPassword?.message,
    ].find(Boolean);

    async function handleSubmit(values: z.infer<typeof signupSchema>) {
        onSubmit?.(values);
        setIsSubmitting(true);
        setIsLoggingIn(true);
        const response = await signUp(values);

        setIsSubmitting(false);
        setIsLoggingIn(false);

        if (!response.success) {
            toast.error(response.message);
            onError?.(new Error(response.message));
            return;
        }

        toast.success(response.message);
        form.reset();
        onSuccess?.(values);

        if (switchToSignin) {
            router.push("/signin");
        }
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="John Doe" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="m@example.com" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex flex-col gap-2">
                    <div className="flex gap-4">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="********"
                                            type="password"
                                            autoComplete="new-password"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="********"
                                            type="password"
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    {passwordError && (
                        <FormMessage>{passwordError}</FormMessage>
                    )}
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoggingIn || isSubmitting}
                    isLoading={isSubmitting}
                >
                    Create Account
                </Button>

                <FormSeparator>or continue with</FormSeparator>

                <div className="flex flex-col gap-3">
                    <AuthLoginButton
                        provider={AUTH_PROVIDER.GOOGLE}
                        className="bg-zinc-800"
                        onLoggingInChange={setIsLoggingIn}
                        disabled={isLoggingIn}
                    >
                        Sign up with Google
                    </AuthLoginButton>
                    <AuthLoginButton
                        provider={AUTH_PROVIDER.GITHUB}
                        className="bg-zinc-800"
                        onLoggingInChange={setIsLoggingIn}
                        disabled={isLoggingIn}
                    >
                        Sign up with Github
                    </AuthLoginButton>
                </div>

                <p className="text-center text-sm text-zinc-300">
                    Already have an account?{" "}
                    <Button
                        variant="link"
                        size="none"
                        className="font-normal !text-inherit underline hover:!text-zinc-50"
                        onClick={() => onSwitchToSignin?.()}
                        type="button"
                        asChild={canLinkToSignin}
                    >
                        {canLinkToSignin ? (
                            <Link href="/signin">Sign in</Link>
                        ) : (
                            <span>Sign in</span>
                        )}
                    </Button>
                </p>
            </form>
        </Form>
    );
}
