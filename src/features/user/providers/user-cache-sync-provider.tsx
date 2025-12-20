import { useQueryClient } from "@tanstack/react-query";
import { createContext, useContext } from "react";
import { useCallback, useMemo } from "react";

import type {
    DBUser,
    DBUserChatPreferences,
    WithPartialUserChatPreferences,
    WithUserId,
} from "@/features/user/lib/types";

import { tag } from "@/lib/cache-tag";
import { RevertFn, SyncActionProps, SyncFn, WithNewName } from "@/lib/types";
import { createCacheUpdater, tabScope } from "@/lib/utils";

import { useBroadcastChannel } from "@/hooks";

type UpdateUserNameAction = {
    type: "updateUserName";
    data: WithUserId & WithNewName;
};

type RevertLastUserUpdateAction = {
    type: "revertLastUserUpdate";
};

type UpdateUserChatPreferencesAction = {
    type: "updateUserChatPreferences";
    data: WithUserId & WithPartialUserChatPreferences;
};

type UserAction =
    | UpdateUserNameAction
    | UpdateUserChatPreferencesAction
    | RevertLastUserUpdateAction
    | UpdateUserChatPreferencesAction;

type UpdateUserNameProps = SyncActionProps<WithUserId & WithNewName>;
type UpdateUserChatPreferencesProps = SyncActionProps<
    WithUserId & WithPartialUserChatPreferences
>;
type RevertLastUserUpdateProps = SyncActionProps;

type UserCacheSyncContextValue = {
    updateUserName: SyncFn<UpdateUserNameProps, RevertFn>;
    revertLastUserUpdate: SyncFn<RevertLastUserUpdateProps>;
    updateUserChatPreferences: SyncFn<UpdateUserChatPreferencesProps>;
};

export const UserCacheSyncContext =
    createContext<UserCacheSyncContextValue | null>(null);

export function UserCacheSyncProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const queryClient = useQueryClient();

    const userCacheUpdater = useMemo(
        () => createCacheUpdater<DBUser>(queryClient),
        [queryClient],
    );

    const userChatPreferencesCacheUpdater = useMemo(
        () => createCacheUpdater<DBUserChatPreferences>(queryClient),
        [queryClient],
    );

    const { postMessage } = useBroadcastChannel<UserAction>({
        channelName: "user-cache-sync",
        onMessage: useCallback(
            (message: UserAction) => {
                if (message.type === "updateUserName") {
                    userCacheUpdater.update(
                        [tag.user(message.data.userId)],
                        (old: DBUser) => ({
                            ...old,
                            name: message.data.newName,
                        }),
                    );
                    return;
                }

                if (message.type === "revertLastUserUpdate") {
                    userCacheUpdater.revert();
                    return;
                }

                if (message.type === "updateUserChatPreferences") {
                    userChatPreferencesCacheUpdater.update(
                        [tag.userChatPreferences(message.data.userId)],
                        (old: DBUserChatPreferences) => ({
                            ...old,
                            ...message.data.userChatPreferences,
                        }),
                    );
                    return;
                }

                const _exhaustiveCheck: never = message;
                throw new Error(`Exhaustive check failed: ${_exhaustiveCheck}`);
            },
            [userCacheUpdater, userChatPreferencesCacheUpdater],
        ),
    });

    const updateUserName = useCallback(
        ({ userId, newName, scope }: UpdateUserNameProps) => {
            tabScope(scope, {
                thisTab: () => {
                    userCacheUpdater.update(
                        [tag.user(userId)],
                        (old: DBUser) => ({
                            ...old,
                            name: newName,
                        }),
                    );
                },
                otherTabs: () => {
                    postMessage({
                        type: "updateUserName",
                        data: { userId, newName },
                    });
                },
            });

            return () =>
                tabScope(scope, {
                    thisTab: () => {
                        userCacheUpdater.revert();
                    },
                    otherTabs: () => {
                        postMessage({ type: "revertLastUserUpdate" });
                    },
                });
        },
        [postMessage, userCacheUpdater],
    );

    const revertLastUserUpdate = useCallback(
        ({ scope }: RevertLastUserUpdateProps = {}) => {
            tabScope(scope, {
                thisTab: () => {
                    userCacheUpdater.revert();
                },
                otherTabs: () => {
                    postMessage({ type: "revertLastUserUpdate" });
                },
            });
        },
        [postMessage, userCacheUpdater],
    );

    const updateUserChatPreferences = useCallback(
        ({
            userId,
            userChatPreferences,
            scope,
        }: UpdateUserChatPreferencesProps) => {
            tabScope(scope, {
                thisTab: () => {
                    userChatPreferencesCacheUpdater.update(
                        [tag.userChatPreferences(userId)],
                        (old: DBUserChatPreferences) => ({
                            ...old,

                            ...userChatPreferences,
                        }),
                    );
                },
                otherTabs: () => {
                    postMessage({
                        type: "updateUserChatPreferences",

                        data: { userId, userChatPreferences },
                    });
                },
            });
        },
        [postMessage, userChatPreferencesCacheUpdater],
    );

    const value = useMemo(
        () => ({
            updateUserName,
            revertLastUserUpdate,
            updateUserChatPreferences,
        }),
        [updateUserName, revertLastUserUpdate, updateUserChatPreferences],
    );

    return (
        <UserCacheSyncContext value={value}>{children}</UserCacheSyncContext>
    );
}

export function useUserCacheSyncContext() {
    const context = useContext(UserCacheSyncContext);

    if (!context) {
        throw new Error(
            "useUserCacheSyncContext must be used within a UserCacheSyncProvider",
        );
    }
    return context;
}
