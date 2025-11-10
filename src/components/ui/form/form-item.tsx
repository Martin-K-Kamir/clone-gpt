"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

type FormItemContextValue = {
    id: string;
};

export const FormItemContext = React.createContext<FormItemContextValue>(
    {} as FormItemContextValue,
);

export function FormItem({ className, ...props }: React.ComponentProps<"div">) {
    const id = React.useId();

    return (
        <FormItemContext value={{ id }}>
            <div
                data-slot="form-item"
                className={cn("grid gap-2", className)}
                {...props}
            />
        </FormItemContext>
    );
}
