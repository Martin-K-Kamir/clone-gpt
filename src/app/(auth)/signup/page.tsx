import { Metadata } from "next";

import { AuthSignUpForm } from "@/features/auth/components/auth-signup-form";

export const metadata: Metadata = {
    title: "Sign up",
    description:
        "Create a new CloneGPT account to start chatting with AI and get help with your questions.",
};

export default function Page() {
    return (
        <div className="flex min-h-svh items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-6 sm:px-6 sm:py-8">
                <h1 className="mb-1 text-center text-xl font-bold">
                    Create an account
                </h1>
                <p className="mb-8 text-center text-sm text-zinc-300">
                    Enter your email below to create your account
                </p>
                <AuthSignUpForm switchToSignin />
            </div>
        </div>
    );
}
