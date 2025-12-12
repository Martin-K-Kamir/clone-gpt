import * as DialogPrimitive from "@radix-ui/react-dialog";
import { createContext, useState } from "react";

export const DialogsContext = createContext<{
    openDialogId: string;
    setOpenDialogId: (openDialogId: string) => void;
}>({
    openDialogId: "",
    setOpenDialogId: () => {},
});

export function Dialogs({ children }: { children: React.ReactNode }) {
    const [openDialogId, setOpenDialogId] = useState("");

    return (
        <DialogsContext value={{ openDialogId, setOpenDialogId }}>
            <DialogPrimitive.Root>{children}</DialogPrimitive.Root>
        </DialogsContext>
    );
}
