"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { memo, useEffect, useState } from "react";

import { AnyComponent } from "@/components/ui/any-component";

import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
import { DBUser } from "@/features/user/lib/types";
import { getUser } from "@/features/user/services/api";

import { tag } from "@/lib/cache-tags";
import { cn, getFirstName } from "@/lib/utils";

function getTimeBasedGreeting(name: string) {
    const hour = new Date().getHours();

    if (hour < 12) return `Good morning, ${name}!`;
    if (hour < 18) return `Good afternoon, ${name}!`;
    return `Good evening, ${name}!`;
}

export const ChatGreeting = ({
    className,
    as: Comp = "h2",
    ...props
}: React.ComponentProps<typeof AnyComponent>) => {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const { data: user } = useQuery({
        queryKey: [tag.user(userId)],
        queryFn: getUser,
        initialData: session?.user as DBUser,
        enabled: !!userId,
    });

    const [greeting, setGreeting] = useState<string | null>(null);

    useEffect(() => {
        if (!user) {
            return;
        }

        const name =
            user.role === USER_ROLE.GUEST ? "there" : getFirstName(user.name);

        setGreeting(getTimeBasedGreeting(name));
    }, [user]);

    if (!greeting) {
        return null;
    }

    return (
        <Comp
            className={cn(
                "whitespace-pre-line bg-gradient-to-r from-indigo-500 to-rose-500 bg-clip-text text-3xl font-bold text-transparent",
                className,
            )}
            {...props}
        >
            {greeting}
        </Comp>
    );
};

export const MemoizedChatGreeting = memo(ChatGreeting);
export const HardMemoizedChatGreeting = memo(ChatGreeting, () => {
    return true;
});
