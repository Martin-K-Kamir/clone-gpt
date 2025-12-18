import preview from "#.storybook/preview";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { expect, fn, waitFor } from "storybook/test";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "./index";

const basicFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
});

const meta = preview.meta({
    component: Form,
    parameters: {
        a11y: {
            test: "error",
        },
    },
});

export const Default = meta.story({
    render: () => {
        const form = useForm<z.infer<typeof basicFormSchema>>({
            resolver: zodResolver(basicFormSchema),
            defaultValues: {
                name: "",
                email: "",
            },
        });

        const onSubmit = fn((values: z.infer<typeof basicFormSchema>) => {
            console.log("Form submitted:", values);
        });

        return (
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="max-w-md space-y-4 rounded-2xl bg-zinc-950 p-4"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Enter your name"
                                    />
                                </FormControl>
                                <FormMessage />
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
                                    <Input
                                        {...field}
                                        type="email"
                                        placeholder="Enter your email"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        );
    },
});

Default.test(
    "should show validation errors when submitting empty form",
    async ({ canvas, userEvent }) => {
        const submitButton = canvas.getByRole("button", { name: /submit/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
            const nameError = canvas.getByText(/name is required/i);
            expect(nameError).toBeVisible();
        });

        const emailError = canvas.getByText(/invalid email address/i);
        expect(emailError).toBeVisible();
    },
);

Default.test(
    "should submit form with valid data without errors",
    async ({ canvas, userEvent }) => {
        const nameInput = canvas.getByPlaceholderText(/enter your name/i);
        const emailInput = canvas.getByPlaceholderText(/enter your email/i);
        const submitButton = canvas.getByRole("button", { name: /submit/i });

        await userEvent.type(nameInput, "John Doe");
        await userEvent.type(emailInput, "john@example.com");
        await userEvent.click(submitButton);

        await waitFor(() => {
            const nameError = canvas.queryByText(/name is required/i);
            const emailError = canvas.queryByText(/invalid email address/i);

            expect(nameError).not.toBeInTheDocument();
            expect(emailError).not.toBeInTheDocument();
        });
    },
);

export const WithDescription = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => {
        const form = useForm<z.infer<typeof basicFormSchema>>({
            resolver: zodResolver(basicFormSchema),
            defaultValues: {
                name: "",
                email: "",
            },
        });

        const onSubmit = fn((values: z.infer<typeof basicFormSchema>) => {
            console.log("Form submitted:", values);
        });

        return (
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="max-w-md space-y-4 rounded-2xl bg-zinc-950 p-4"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Enter your name"
                                    />
                                </FormControl>
                                <FormDescription>
                                    This is your public display name.
                                </FormDescription>
                                <FormMessage />
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
                                    <Input
                                        {...field}
                                        type="email"
                                        placeholder="Enter your email"
                                    />
                                </FormControl>
                                <FormDescription>
                                    We&apos;ll never share your email with
                                    anyone else.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        );
    },
});

export const WithErrors = meta.story({
    render: () => {
        const form = useForm<z.infer<typeof basicFormSchema>>({
            resolver: zodResolver(basicFormSchema),
            defaultValues: {
                name: "",
                email: "invalid-email",
            },
        });

        // Trigger validation errors
        form.trigger();

        const onSubmit = fn((values: z.infer<typeof basicFormSchema>) => {
            console.log("Form submitted:", values);
        });

        return (
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="max-w-md space-y-4 rounded-2xl bg-zinc-950 p-4"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Enter your name"
                                    />
                                </FormControl>
                                <FormMessage />
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
                                    <Input
                                        {...field}
                                        type="email"
                                        placeholder="Enter your email"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        );
    },
});

const complexFormSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    bio: z.string().min(10, "Bio must be at least 10 characters"),
    age: z.coerce.number().min(18, "You must be at least 18 years old"),
});

export const ComplexForm = meta.story({
    render: () => {
        const form = useForm<z.infer<typeof complexFormSchema>>({
            resolver: zodResolver(complexFormSchema),
            defaultValues: {
                name: "",
                email: "",
                bio: "",
                age: undefined,
            },
        });

        const onSubmit = fn((values: z.infer<typeof complexFormSchema>) => {
            console.log("Form submitted:", values);
        });

        return (
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="max-w-md space-y-6"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Enter your name"
                                    />
                                </FormControl>
                                <FormDescription>
                                    Your full name as it should appear.
                                </FormDescription>
                                <FormMessage />
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
                                    <Input
                                        {...field}
                                        type="email"
                                        placeholder="Enter your email"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Age</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        type="number"
                                        placeholder="Enter your age"
                                    />
                                </FormControl>
                                <FormDescription>
                                    You must be at least 18 years old.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Bio</FormLabel>
                                <FormControl>
                                    <Textarea
                                        {...field}
                                        placeholder="Tell us about yourself"
                                        rows={4}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Write a short bio about yourself (minimum 10
                                    characters).
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex gap-2">
                        <Button type="submit">Submit</Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => form.reset()}
                        >
                            Reset
                        </Button>
                    </div>
                </form>
            </Form>
        );
    },
});

ComplexForm.test(
    "should reset form when reset button is clicked",
    async ({ canvas, userEvent }) => {
        const nameInput = canvas.getByPlaceholderText(/enter your name/i);
        const resetButton = canvas.getByRole("button", { name: /reset/i });

        await userEvent.type(nameInput, "Test Name");
        expect(nameInput).toHaveValue("Test Name");

        await userEvent.click(resetButton);

        await waitFor(() => {
            expect(nameInput).toHaveValue("");
        });
    },
);

export const WithDefaultValues = meta.story({
    render: () => {
        const form = useForm<z.infer<typeof basicFormSchema>>({
            resolver: zodResolver(basicFormSchema),
            defaultValues: {
                name: "John Doe",
                email: "john.doe@example.com",
            },
        });

        const onSubmit = fn((values: z.infer<typeof basicFormSchema>) => {
            console.log("Form submitted:", values);
        });

        return (
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="max-w-md space-y-4 rounded-2xl bg-zinc-950 p-4"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Enter your name"
                                    />
                                </FormControl>
                                <FormMessage />
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
                                    <Input
                                        {...field}
                                        type="email"
                                        placeholder="Enter your email"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex gap-2">
                        <Button type="submit">Submit</Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => form.reset()}
                        >
                            Reset
                        </Button>
                    </div>
                </form>
            </Form>
        );
    },
});

WithDefaultValues.test(
    "should display default values in form fields",
    async ({ canvas }) => {
        const nameInput = canvas.getByPlaceholderText(/enter your name/i);
        const emailInput = canvas.getByPlaceholderText(/enter your email/i);

        expect(nameInput).toHaveValue("John Doe");
        expect(emailInput).toHaveValue("john.doe@example.com");
    },
);

WithDefaultValues.test(
    "should allow editing default values",
    async ({ canvas, userEvent }) => {
        const nameInput = canvas.getByPlaceholderText(/enter your name/i);

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, "Jane Smith");

        expect(nameInput).toHaveValue("Jane Smith");
    },
);

WithDefaultValues.test(
    "should reset form to default values",
    async ({ canvas, userEvent }) => {
        const nameInput = canvas.getByPlaceholderText(/enter your name/i);
        const resetButton = canvas.getByRole("button", { name: /reset/i });

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, "Changed Name");
        expect(nameInput).toHaveValue("Changed Name");

        await userEvent.click(resetButton);

        await waitFor(() => {
            expect(nameInput).toHaveValue("John Doe");
        });
    },
);

WithDefaultValues.test(
    "should submit form with default values",
    async ({ canvas, userEvent }) => {
        const submitButton = canvas.getByRole("button", { name: /submit/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
            const nameError = canvas.queryByText(/name is required/i);
            const emailError = canvas.queryByText(/invalid email address/i);

            expect(nameError).not.toBeInTheDocument();
            expect(emailError).not.toBeInTheDocument();
        });
    },
);

export const WithDisabledFields = meta.story({
    parameters: {
        a11y: {
            disable: true,
        },
    },
    render: () => {
        const form = useForm<z.infer<typeof basicFormSchema>>({
            resolver: zodResolver(basicFormSchema),
            defaultValues: {
                name: "John Doe",
                email: "john.doe@example.com",
            },
        });

        const onSubmit = fn((values: z.infer<typeof basicFormSchema>) => {
            console.log("Form submitted:", values);
        });

        return (
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="max-w-md space-y-4 rounded-2xl bg-zinc-950 p-4"
                >
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input
                                        {...field}
                                        placeholder="Enter your name"
                                    />
                                </FormControl>
                                <FormDescription>
                                    This field can be edited.
                                </FormDescription>
                                <FormMessage />
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
                                    <Input
                                        {...field}
                                        type="email"
                                        placeholder="Enter your email"
                                        disabled
                                    />
                                </FormControl>
                                <FormDescription>
                                    This field is disabled and cannot be edited.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit">Submit</Button>
                </form>
            </Form>
        );
    },
});

WithDisabledFields.test("should display disabled field", async ({ canvas }) => {
    const emailInput = canvas.getByPlaceholderText(/enter your email/i);

    expect(emailInput).toBeDisabled();
});

WithDisabledFields.test("should display enabled field", async ({ canvas }) => {
    const nameInput = canvas.getByPlaceholderText(/enter your name/i);

    expect(nameInput).not.toBeDisabled();
});
