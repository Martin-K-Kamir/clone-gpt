"use client";

import { createContext, useCallback, useContext, useState } from "react";

import { usePrevious } from "@/hooks";

type ChatOffsetContext = {
    clientOffset: number;
    prevClientOffset: number | undefined;
    incrementOffset: () => void;
    decrementOffset: () => void;
    resetOffset: () => void;
    setOffset: (offset: number) => void;
};

export const ChatOffsetContext = createContext<ChatOffsetContext | null>(null);

export function ChatOffsetProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [clientOffset, setClientOffset] = useState(0);
    const prevClientOffset = usePrevious(clientOffset);

    const incrementOffset = useCallback(() => {
        setClientOffset(prev => prev + 1);
    }, []);

    const decrementOffset = useCallback(() => {
        setClientOffset(prev => prev - 1);
    }, []);

    const resetOffset = useCallback(() => {
        setClientOffset(0);
    }, []);

    const setOffset = useCallback((offset: number) => {
        setClientOffset(offset);
    }, []);

    return (
        <ChatOffsetContext.Provider
            value={{
                clientOffset,
                prevClientOffset: prevClientOffset,
                incrementOffset,
                decrementOffset,
                resetOffset,
                setOffset,
            }}
        >
            {children}
        </ChatOffsetContext.Provider>
    );
}

export function useChatOffsetContext() {
    const context = useContext(ChatOffsetContext);

    if (!context) {
        throw new Error(
            "useChatOffsetContext must be used within a ChatOffsetProvider",
        );
    }
    return context;
}
