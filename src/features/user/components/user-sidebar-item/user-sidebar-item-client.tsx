"use client";

import { IconDotsVertical } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
    UserSidebarItemDropdownMenu,
    UserSidebarItemDropdownMenuTrigger,
} from "@/features/user/components/user-sidebar-item-dropdown-menu";
import { USER_ROLE } from "@/features/user/lib/constants/user-roles";
import type { UIUser } from "@/features/user/lib/types";
import { useUserSessionContext } from "@/features/user/providers";
import { getUser } from "@/features/user/services/api";

import { tag } from "@/lib/cache-tag";
import { getFirstTwoCapitalLetters } from "@/lib/utils";

type UserSidebarItemClientProps = {
    user: UIUser;
};

export function UserSidebarItemClient({
    user: initialUser,
}: UserSidebarItemClientProps) {
    const { setUser } = useUserSessionContext();

    const { data: user } = useQuery({
        queryKey: [tag.user(initialUser.id)],
        queryFn: getUser,
        initialData: initialUser,
        enabled: !!initialUser.id,
    });

    useEffect(() => {
        setUser(user);
    }, [user, setUser]);

    const isGuest = user.role === USER_ROLE.GUEST;
    const isUserOrAdmin =
        user.role === USER_ROLE.ADMIN || user.role === USER_ROLE.USER;

    return (
        <UserSidebarItemDropdownMenu
            user={user}
            showSettings={!isGuest}
            showLogout={!isGuest}
            showLogin={!isUserOrAdmin}
        >
            <SidebarMenu>
                <SidebarMenuItem>
                    <UserSidebarItemDropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" className="gap-3">
                            <Avatar className="size-8 rounded-lg">
                                {user.image && (
                                    <AvatarImage
                                        src={user.image}
                                        alt={user.name}
                                    />
                                )}
                                <AvatarFallback className="rounded-lg">
                                    {getFirstTwoCapitalLetters(user.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium text-zinc-50">
                                    {user.name}
                                </span>
                                {!isGuest && (
                                    <span className="truncate text-xs text-zinc-200">
                                        {user.email}
                                    </span>
                                )}
                            </div>
                            <IconDotsVertical className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </UserSidebarItemDropdownMenuTrigger>
                </SidebarMenuItem>
            </SidebarMenu>
        </UserSidebarItemDropdownMenu>
    );
}
