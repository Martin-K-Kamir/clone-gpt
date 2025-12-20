"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconRefresh } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useTransition } from "react";
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
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import {
    AI_CHARACTERISTICS,
    AI_PERSONALITIES,
} from "@/features/chat/lib/constants";
import type { AICharacteristicValue } from "@/features/chat/lib/types";

import { USER_ROLE_PLACEHOLDERS } from "@/features/user/lib/constants";
import { userChatPreferenceSchema } from "@/features/user/lib/schemas";
import type { UIUser } from "@/features/user/lib/types";
import { useUserCacheSyncContext } from "@/features/user/providers";
import { upsertUserChatPreferences } from "@/features/user/services/actions";
import { getUserChatPreferences } from "@/features/user/services/api";

import { tag } from "@/lib/cache-tag";

import { useSelectableItems } from "@/hooks";

type UserChatPreferenceFormProps = {
    user: UIUser;
};

export function UserChatPreferenceForm({ user }: UserChatPreferenceFormProps) {
    const userCacheSync = useUserCacheSyncContext();
    const [isPending, startTransition] = useTransition();
    const {
        canRefresh,
        items: characteristics,
        selectItem: selectCharacteristic,
        refreshItems: refreshCharacteristics,
    } = useSelectableItems(Object.values(AI_CHARACTERISTICS));

    const {
        data: userChatPreferences,
        error: userChatPreferencesError,
        isPending: isUserChatPreferencesPending,
    } = useQuery({
        queryKey: [tag.userChatPreferences(user.id)],
        queryFn: () => getUserChatPreferences(),
    });

    const form = useForm<z.infer<typeof userChatPreferenceSchema>>({
        resolver: zodResolver(userChatPreferenceSchema),
        defaultValues: {
            nickname: userChatPreferences?.nickname || "",
            role: userChatPreferences?.role || "",
            extraInfo: userChatPreferences?.extraInfo || "",
            personality: userChatPreferences?.personality || "FRIENDLY",
            characteristics: userChatPreferences?.characteristics || "",
        },
    });

    useEffect(() => {
        if (userChatPreferencesError) {
            toast.error(userChatPreferencesError.message, {
                duration: 8_000,
            });
        }
    }, [userChatPreferencesError]);

    useEffect(() => {
        if (userChatPreferences) {
            form.reset({
                nickname: userChatPreferences.nickname || "",
                role: userChatPreferences.role || "",
                extraInfo: userChatPreferences.extraInfo || "",
                personality: userChatPreferences.personality || "FRIENDLY",
                characteristics: userChatPreferences.characteristics || "",
            });
        }
    }, [userChatPreferences, form]);

    function handleCharacteristicClick(characteristic: AICharacteristicValue) {
        const currentValue = form.getValues("characteristics") || "";
        form.setValue(
            "characteristics",
            `${currentValue} ${characteristic.description}`.trim(),
        );
        selectCharacteristic(characteristic);
    }

    async function onSubmit(values: z.infer<typeof userChatPreferenceSchema>) {
        startTransition(async () => {
            const result = await upsertUserChatPreferences({
                userChatPreferences: values,
            });

            if (!result.success) {
                toast.error(result.message);
                return;
            }

            toast.success(result.message);
            userCacheSync.updateUserChatPreferences({
                userId: user.id,
                userChatPreferences: values,
            });
        });
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="nickname"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>How should CloneGPT call you?</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    placeholder="e.g. John"
                                    isLoading={isUserChatPreferencesPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>What is your role?</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Input
                                        {...field}
                                        placeholderAnimation
                                        randomize
                                        placeholders={USER_ROLE_PLACEHOLDERS}
                                        isLoading={isUserChatPreferencesPending}
                                        runAnimation={
                                            !isUserChatPreferencesPending
                                        }
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="personality"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                What kind of personality should CloneGPT have?
                            </FormLabel>
                            <FormControl>
                                <Select
                                    {...field}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger
                                        className="w-full"
                                        isLoading={isUserChatPreferencesPending}
                                    >
                                        <SelectValue placeholder="Select a personality" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(AI_PERSONALITIES).map(
                                            ([key, value]) => (
                                                <SelectItem
                                                    key={key}
                                                    value={key}
                                                >
                                                    <span>{value.title}</span> -
                                                    <span className="text-xs text-zinc-400">
                                                        {value.description}
                                                    </span>
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="characteristics"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                What characteristics should CloneGPT have?
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder="Describe or choose characteristics"
                                    className="h-24 resize-none"
                                    isLoading={isUserChatPreferencesPending}
                                />
                            </FormControl>
                            <div className="flex flex-wrap gap-2">
                                {characteristics.map(item => (
                                    <Button
                                        key={item.id}
                                        variant="outline"
                                        onClick={() => {
                                            handleCharacteristicClick(item);
                                        }}
                                        className="h-7 rounded-full text-xs sm:h-8 sm:text-sm"
                                        size="sm"
                                        type="button"
                                        disabled={isUserChatPreferencesPending}
                                    >
                                        {item.title}
                                    </Button>
                                ))}
                                {canRefresh && (
                                    <Button
                                        variant="outline"
                                        onClick={refreshCharacteristics}
                                        className="size-8 rounded-full"
                                        size="icon"
                                        type="button"
                                        disabled={isUserChatPreferencesPending}
                                    >
                                        <IconRefresh />
                                    </Button>
                                )}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="extraInfo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>
                                Is there anything else CloneGPT should know
                                about you?
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    placeholder="Interests, values, or preferences to keep in mind"
                                    className="h-24 resize-none"
                                    isLoading={isUserChatPreferencesPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="flex items-center gap-2.5">
                    <Button
                        type="submit"
                        disabled={isPending}
                        isLoading={isPending}
                    >
                        Save
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isPending}
                        onClick={() => {
                            form.reset({
                                nickname: "",
                                role: "",
                                extraInfo: "",
                                personality: "FRIENDLY",
                                characteristics: "",
                            });
                        }}
                    >
                        Reset
                    </Button>
                </div>
            </form>
        </Form>
    );
}
