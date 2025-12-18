import {
    IconAdjustments,
    IconDots,
    IconLogin,
    IconLogout,
    IconMessageShare,
    IconUser,
} from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Dialogs } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
    AuthSignInDialog,
    AuthSignInDialogTrigger,
} from "@/features/auth/components/auth-signin-dialog";
import { AuthSignOutButton } from "@/features/auth/components/auth-signout-button";

import {
    UserChatPreferenceDialog,
    UserChatPreferenceDialogTrigger,
} from "@/features/user/components/user-chat-preference-dialog";
import {
    UserProfileDialog,
    UserProfileDialogTrigger,
} from "@/features/user/components/user-profile-dialog";
import {
    UserSharedChatsDialog,
    UserSharedChatsDialogTrigger,
} from "@/features/user/components/user-shared-chats-dialog";
import type { UIUser } from "@/features/user/lib/types";

type UserSidebarItemDropdownMenuProps = {
    user: UIUser;
    showSettings?: boolean;
    showChatPreferences?: boolean;
    showSharedChats?: boolean;
    showLogout?: boolean;
    showLogin?: boolean;
} & React.ComponentProps<typeof DropdownMenu>;

export function UserSidebarItemDropdownMenu({
    user,
    children,
    showSettings = true,
    showChatPreferences = true,
    showSharedChats = true,
    showLogout = true,
    showLogin = true,
    ...props
}: UserSidebarItemDropdownMenuProps) {
    return (
        <Dialogs>
            <DropdownMenu modal={false} {...props}>
                {children}

                <DropdownMenuContent
                    className="w-(--radix-dropdown-menu-trigger-width) rounded-lg"
                    sideOffset={8}
                    onCloseAutoFocus={e => e.preventDefault()}
                >
                    {showSettings && (
                        <UserProfileDialogTrigger
                            asChild
                            dialogId="profile-dialog"
                        >
                            <DropdownMenuItem>
                                <IconUser />
                                User Settings
                            </DropdownMenuItem>
                        </UserProfileDialogTrigger>
                    )}

                    {showChatPreferences && (
                        <UserChatPreferenceDialogTrigger
                            asChild
                            dialogId="chat-preference-dialog"
                        >
                            <DropdownMenuItem>
                                <IconAdjustments />
                                Chat Preferences
                            </DropdownMenuItem>
                        </UserChatPreferenceDialogTrigger>
                    )}

                    {showSharedChats && (
                        <UserSharedChatsDialogTrigger
                            asChild
                            dialogId="shared-chats-dialog"
                        >
                            <DropdownMenuItem>
                                <IconMessageShare />
                                Shared Chats
                            </DropdownMenuItem>
                        </UserSharedChatsDialogTrigger>
                    )}

                    <DropdownMenuSeparator />

                    {showLogout && (
                        <AuthSignOutButton asChild styled={false}>
                            <DropdownMenuItem>
                                <IconLogout />
                                Log out
                            </DropdownMenuItem>
                        </AuthSignOutButton>
                    )}

                    {showLogin && (
                        <AuthSignInDialogTrigger
                            asChild
                            dialogId="login-dialog"
                        >
                            <DropdownMenuItem>
                                <IconLogin />
                                Log in
                            </DropdownMenuItem>
                        </AuthSignInDialogTrigger>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <UserProfileDialog user={user} dialogId="profile-dialog" />
            <UserChatPreferenceDialog
                user={user}
                dialogId="chat-preference-dialog"
            />
            <UserSharedChatsDialog dialogId="shared-chats-dialog" />
            <AuthSignInDialog dialogId="login-dialog" />
        </Dialogs>
    );
}

export function UserSidebarItemDropdownMenuTrigger({
    children,
    ...props
}: React.ComponentProps<typeof DropdownMenuTrigger>) {
    return children ? (
        <DropdownMenuTrigger {...props}>{children}</DropdownMenuTrigger>
    ) : (
        <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost">
                <IconDots className="size-4" />
            </Button>
        </DropdownMenuTrigger>
    );
}
