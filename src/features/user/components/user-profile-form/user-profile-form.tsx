"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import type { UIUser } from "@/features/user/lib/types";
import { useUserCacheSyncContext } from "@/features/user/providers";
import { updateUserName } from "@/features/user/services/actions";

const formSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
});

type UserProfileFormProps = {
    user: UIUser;
};

export function UserProfileForm({ user }: UserProfileFormProps) {
    const [isDisabled, setIsDisabled] = useState(false);
    const userCacheSync = useUserCacheSyncContext();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: user.name,
            email: user.email,
        },
    });

    const watchName = form.watch("name");

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsDisabled(true);
        const response = await updateUserName({ newName: values.name });

        if (response.success) {
            toast.success(response.message);
            userCacheSync.updateUserName({
                userId: user.id,
                newName: values.name,
            });
        } else {
            toast.error(response.message);
        }
    }

    return (
        <Form {...form} key={user.name}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    onFocus={() => setIsDisabled(false)}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field} disabled />
                            </FormControl>
                        </FormItem>
                    )}
                />
                <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-400">
                        Update your profile information.
                    </p>
                    <Button
                        type="submit"
                        size="sm"
                        isLoading={form.formState.isSubmitting}
                        disabled={
                            form.formState.isSubmitting ||
                            watchName === user.name ||
                            isDisabled
                        }
                    >
                        Update Profile
                    </Button>
                </div>
            </form>
        </Form>
    );
}
