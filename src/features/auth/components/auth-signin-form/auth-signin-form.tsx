"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
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

import { AuthSignInButton } from "@/features/auth/components/auth-signin-button";
import { AUTH_PROVIDER } from "@/features/auth/lib/constants";
import { signinSchema } from "@/features/auth/lib/schemas";
import { signInWithCredentials } from "@/features/auth/services/actions";

type AuthSignInFormProps = {
    onSwitchToSignup?: () => void;
    onSubmit?: (values: z.infer<typeof signinSchema>) => void;
    onSuccess?: (values: z.infer<typeof signinSchema>) => void;
    onError?: (error: Error | unknown) => void;
};

export function AuthSignInForm({
    onSwitchToSignup,
    onSubmit,
    onSuccess,
    onError,
}: AuthSignInFormProps) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isSigningIn, setIsSigningIn] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const form = useForm<z.infer<typeof signinSchema>>({
        resolver: zodResolver(signinSchema),
        defaultValues: {
            email: "max@test1.cz",
            password: "martin123",
        },
    });

    const canLinkToSignup = typeof onSwitchToSignup === "undefined";

    async function handleSubmit(values: z.infer<typeof signinSchema>) {
        onSubmit?.(values);
        setIsSubmitting(true);
        setIsSigningIn(true);

        const response = await signInWithCredentials({
            email: values.email,
            password: values.password,
        });

        await queryClient.resetQueries();

        setIsSubmitting(false);
        setIsSigningIn(false);

        if (!response.success) {
            toast.error(response.message);
            onError?.(new Error(response.message));
            return;
        }

        router.push("/");
        toast.success(response.message);
        form.reset();
        onSuccess?.(values);
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
            >
                <div className="flex flex-col gap-3">
                    <AuthSignInButton
                        provider={AUTH_PROVIDER.GOOGLE}
                        className="bg-zinc-800"
                        onSigningInChange={setIsSigningIn}
                        disabled={isSigningIn}
                    >
                        Login with Google
                    </AuthSignInButton>
                    <AuthSignInButton
                        provider={AUTH_PROVIDER.GITHUB}
                        className="bg-zinc-800"
                        onSigningInChange={setIsSigningIn}
                        disabled={isSigningIn}
                    >
                        Login with Github
                    </AuthSignInButton>
                </div>

                <FormSeparator className="my-4">or continue with</FormSeparator>

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

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="********"
                                    type="password"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="mb-4 w-full"
                    disabled={isSigningIn || isSubmitting}
                    isLoading={isSubmitting}
                >
                    Login
                </Button>

                <p className="text-center text-sm text-zinc-300">
                    Don&apos;t have an account?{" "}
                    <Button
                        variant="link"
                        size="none"
                        className="font-normal !text-inherit underline hover:!text-zinc-50"
                        onClick={() => onSwitchToSignup?.()}
                        type="button"
                        asChild={canLinkToSignup}
                    >
                        {canLinkToSignup ? (
                            <Link href="/signup">Sign up</Link>
                        ) : (
                            <span>Sign up</span>
                        )}
                    </Button>
                </p>
            </form>
        </Form>
    );
}
