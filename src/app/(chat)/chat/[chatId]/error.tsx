"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { ChatViewHeaderSkeleton } from "@/features/chat/components/chat-view-header";

export default function Error() {
    return (
        <>
            <ChatViewHeaderSkeleton showActions={false} />
            <div className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center py-12 text-center">
                <h2 className="bg-gradient-to-r from-indigo-500 to-rose-500 bg-clip-text text-3xl font-bold text-transparent">
                    Chat Not Found
                </h2>
                <p className="mt-3 text-pretty text-zinc-100">
                    The chat is not accessible. It may be private or no longer
                    exists.
                </p>

                <Button className="mt-8" asChild size="lg">
                    <Link href="/">Start a new chat</Link>
                </Button>
            </div>
        </>
    );
}
