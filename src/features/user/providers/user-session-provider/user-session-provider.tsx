import { createContext, useContext, useState } from "react";

import type { UIUser } from "@/features/user/lib/types";

type UserSessionContextValue = {
    user: UIUser | null;
    setUser: (user: UIUser | null) => void;
};

export const UserSessionContext = createContext<UserSessionContextValue | null>(
    null,
);

export function UserSessionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<UIUser | null>(null);

    return (
        <UserSessionContext.Provider value={{ user, setUser }}>
            {children}
        </UserSessionContext.Provider>
    );
}

export function useUserSessionContext() {
    const context = useContext(UserSessionContext);
    if (!context) {
        throw new Error(
            "useUserSessionContext must be used within a UserSessionProvider",
        );
    }
    return context;
}
