import { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
    title: "Logged out",
    description:
        "You have been logged out of CloneGPT. You can log in again to continue using the application.",
    robots: {
        index: false,
        follow: false,
    },
};

export default function Page() {
    return (
        <div className="flex min-h-svh items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-8 text-center">
                <h1 className="mb-1 text-xl font-bold">
                    You have been logged out
                </h1>
                <p className="mb-8 text-pretty text-sm text-zinc-300">
                    You can log in again to continue using the application.
                </p>
                <Button asChild className="w-full">
                    <Link href="/signin">Log in again</Link>
                </Button>
            </div>
        </div>
    );
}
