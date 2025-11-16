import { Metadata } from "next";

import { AuthSigninForm } from "@/features/auth/components/auth-signin-form";

export const metadata: Metadata = {
    title: "Sign in",
    description:
        "Sign in to CloneGPT to continue your conversations and access your chat history.",
};

export default function Page() {
    return (
        <div className="flex min-h-svh items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-6 sm:px-6 sm:py-8">
                <h1 className="mb-1 text-center text-xl font-bold">
                    Welcome back!
                </h1>
                <p className="mb-8 text-center text-sm text-zinc-300">
                    Login with your Google or Github account{" "}
                </p>
                <AuthSigninForm />
            </div>
        </div>
    );
}
