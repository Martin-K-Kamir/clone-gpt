"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { reset: () => void }) {
    return (
        <div className="flex min-h-svh items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-8">
                <h1 className="mb-1 text-center text-xl font-bold">
                    500 - Internal Server Error
                </h1>
                <p className="mb-8 text-pretty text-center text-sm text-zinc-300">
                    Something went wrong. Please try again later.
                </p>
                <Button className="w-full" onClick={reset}>
                    Try again
                </Button>
            </div>
        </div>
    );
}
