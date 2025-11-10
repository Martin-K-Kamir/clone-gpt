import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex min-h-svh items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-8">
                <h1 className="mb-1 text-center text-xl font-bold">
                    404 - Not Found
                </h1>
                <p className="mb-8 text-pretty text-center text-sm text-zinc-300">
                    The page you are looking for does not exist.
                </p>
                <Button className="w-full" asChild>
                    <Link href="/">Go to home</Link>
                </Button>
            </div>
        </div>
    );
}
