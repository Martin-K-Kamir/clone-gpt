"use client";

import { IconDotsVertical } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";

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
import { getUser } from "@/features/user/services/api";

import { tag } from "@/lib/cache-tags";
import { getFirstTwoCapitalLetters } from "@/lib/utils";

type UserSidebarItemClientProps = {
    user: UIUser;
};

export function UserSidebarItemClient({ user }: UserSidebarItemClientProps) {
    const { data: userData } = useQuery({
        queryKey: [tag.user(user.id)],
        queryFn: getUser,
        initialData: user,
        enabled: !!user.id,
    });

    const isGuest = userData.role === USER_ROLE.GUEST;
    const isUserOrAdmin =
        userData.role === USER_ROLE.ADMIN || userData.role === USER_ROLE.USER;

    return (
        <UserSidebarItemDropdownMenu
            user={userData}
            showSettings={!isGuest}
            showLogout={!isGuest}
            showLogin={!isUserOrAdmin}
        >
            <SidebarMenu>
                <SidebarMenuItem>
                    <UserSidebarItemDropdownMenuTrigger asChild>
                        <SidebarMenuButton size="lg" className="gap-3">
                            <Avatar className="size-8 rounded-lg">
                                {userData.image && (
                                    <AvatarImage
                                        src={userData.image}
                                        alt={userData.name}
                                    />
                                )}
                                <AvatarFallback className="rounded-lg">
                                    {getFirstTwoCapitalLetters(userData.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium text-zinc-50">
                                    {userData.name}
                                </span>
                                {!isGuest && (
                                    <span className="truncate text-xs text-zinc-200">
                                        {userData.email}
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
