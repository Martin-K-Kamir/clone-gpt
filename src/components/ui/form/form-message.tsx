"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { useFormField } from "./form-field";

export function FormMessage({
    className,
    ...props
}: React.ComponentProps<"p">) {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message ?? "") : props.children;

    if (!body) {
        return null;
    }

    return (
        <p
            data-slot="form-message"
            id={formMessageId}
            className={cn("text-sm text-rose-500", className)}
            {...props}
        >
            {body}
        </p>
    );
}
