import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";

type ChatSidebarContext = {
    scrollHistoryToTop: () => void;
    setChatHistoryRef: (ref: React.RefObject<HTMLDivElement | null>) => void;
};

export const ChatSidebarContext = createContext<ChatSidebarContext | null>(
    null,
);

export function ChatSidebarProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [chatHistoryRef, setChatHistoryRef] = useState<
        React.RefObject<HTMLDivElement | null>
    >({ current: null });

    const scrollHistoryToTop = useCallback(() => {
        if (!chatHistoryRef?.current) return;

        chatHistoryRef.current.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    }, [chatHistoryRef]);

    const value = useMemo(
        () => ({ scrollHistoryToTop, setChatHistoryRef }),
        [scrollHistoryToTop, setChatHistoryRef],
    );

    return <ChatSidebarContext value={value}>{children}</ChatSidebarContext>;
}

export function useChatSidebarContext() {
    const context = useContext(ChatSidebarContext);
    if (!context) {
        throw new Error(
            "useChatSidebarContext must be used within a ChatSidebarProvider.",
        );
    }
    return context;
}
