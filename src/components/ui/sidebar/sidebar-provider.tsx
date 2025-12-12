"use client";

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useMediaQuery } from "usehooks-ts";

import { TooltipProvider } from "@/components/ui/tooltip";

import { COOKIE_SIDEBAR } from "@/lib/constants";
import { cn } from "@/lib/utils";

import {
    SIDEBAR_KEYBOARD_SHORTCUT,
    SIDEBAR_WIDTH,
    SIDEBAR_WIDTH_ICON,
} from "./constants";

type SidebarContextProps = {
    state: "expanded" | "collapsed";
    open: boolean;
    openMobile: boolean;
    isMobile: boolean;
    toggleSidebar: () => void;
    setOpen: (open: boolean) => void;
    setOpenMobile: (open: boolean) => void;
};

export const SidebarContext = createContext<SidebarContextProps | null>(null);

type SidebarProviderProps = {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
} & React.ComponentProps<"div">;

export function SidebarProvider({
    className,
    style,
    children,
    open: openProp,
    onOpenChange: setOpenProp,
    defaultOpen = true,
    ...props
}: SidebarProviderProps) {
    const isMobile = useMediaQuery("(max-width: 72.625rem)", {
        defaultValue: false,
    });
    const [openMobile, setOpenMobile] = useState(false);

    const [_open, _setOpen] = useState(defaultOpen);
    const open = openProp ?? _open;

    const setOpen = useCallback(
        (value: boolean | ((value: boolean) => boolean)) => {
            const openState = typeof value === "function" ? value(open) : value;
            if (setOpenProp) {
                setOpenProp(openState);
            } else {
                _setOpen(openState);
            }

            // This sets the cookie to keep the sidebar state.
            document.cookie = `${COOKIE_SIDEBAR.NAME}=${openState}; path=/; max-age=${COOKIE_SIDEBAR.MAX_AGE}`;
        },
        [setOpenProp, open],
    );

    // Helper to toggle the sidebar.
    const toggleSidebar = useCallback(() => {
        return isMobile ? setOpenMobile(open => !open) : setOpen(open => !open);
    }, [isMobile, setOpen, setOpenMobile]);

    // Adds a keyboard shortcut to toggle the sidebar.
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
                (event.metaKey || event.ctrlKey)
            ) {
                event.preventDefault();
                toggleSidebar();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);

    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const state = open ? "expanded" : "collapsed";

    const contextValue = useMemo<SidebarContextProps>(
        () => ({
            state,
            open,
            setOpen,
            isMobile,
            openMobile,
            setOpenMobile,
            toggleSidebar,
        }),
        [
            state,
            open,
            setOpen,
            isMobile,
            openMobile,
            setOpenMobile,
            toggleSidebar,
        ],
    );

    return (
        <SidebarContext value={contextValue}>
            <TooltipProvider delayDuration={0}>
                <div
                    data-slot="sidebar-wrapper"
                    style={
                        {
                            "--sidebar-width": SIDEBAR_WIDTH,
                            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                            ...style,
                        } as React.CSSProperties
                    }
                    className={cn(
                        "group/sidebar-wrapper has-data-[variant=inset]:bg-zinc-950 flex min-h-svh w-full",
                        className,
                    )}
                    {...props}
                >
                    {children}
                </div>
            </TooltipProvider>
        </SidebarContext>
    );
}

export function useSidebarContext() {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider.");
    }

    return context;
}
