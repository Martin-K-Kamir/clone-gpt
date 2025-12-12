"use client";

import * as LabelPrimitive from "@radix-ui/react-label";

import { Label } from "@/components/ui/label";

import { cn } from "@/lib/utils";

import { useFormField } from "./form-field";

export function FormLabel({
    className,
    ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
    const { error, formItemId } = useFormField();

    return (
        <Label
            data-slot="form-label"
            data-error={!!error}
            className={cn("data-[error=true]:text-rose-500", className)}
            htmlFor={formItemId}
            {...props}
        />
    );
}
