import { getFileInput } from "#.storybook/lib/utils/elements";
import preview from "#.storybook/preview";
import type { ChatStatus } from "ai";
import { expect, fn, userEvent, waitFor } from "storybook/test";

import { PromptComposer } from "./prompt-composer";

const meta = preview.meta({
    component: PromptComposer,
    args: {
        placeholder: "Send a message...",
        onSubmit: fn(),
        onFileSelect: fn(),
        onFilePaste: fn(),
        onCancel: fn(),
        onStop: fn(),
    },
    argTypes: {
        value: {
            control: "text",
            description: "Controlled value of the textarea",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        defaultValue: {
            control: "text",
            description: "Default value of the textarea",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        variant: {
            control: "select",
            options: ["submit", "update"],
            description: "Variant of the prompt composer",
            table: {
                type: {
                    summary: '"submit" | "update"',
                },
                defaultValue: {
                    summary: '"submit"',
                },
            },
        },
        placeholder: {
            control: "text",
            description: "Placeholder text for the textarea",
            table: {
                type: {
                    summary: "string",
                },
                defaultValue: {
                    summary: '"Send a message..."',
                },
            },
        },
        status: {
            control: "select",
            options: ["idle", "submitted", "streaming", "error"],
            description: "Chat status that affects button visibility",
            table: {
                type: {
                    summary: "ChatStatus",
                },
            },
        },
        min: {
            control: "number",
            description: "Minimum character length required to submit",
            table: {
                type: {
                    summary: "number",
                },
            },
        },
        max: {
            control: "number",
            description: "Maximum character length allowed",
            table: {
                type: {
                    summary: "number",
                },
            },
        },
        disabled: {
            control: "boolean",
            description: "Whether the composer is disabled",
            table: {
                type: {
                    summary: "boolean",
                },
                defaultValue: {
                    summary: "false",
                },
            },
        },
        disabledFileButton: {
            control: "boolean",
            description: "Whether the file button is disabled",
            table: {
                type: {
                    summary: "boolean",
                },
                defaultValue: {
                    summary: "false",
                },
            },
        },
        autoFocus: {
            control: "boolean",
            description: "Whether to auto-focus the textarea",
            table: {
                type: {
                    summary: "boolean",
                },
                defaultValue: {
                    summary: "true",
                },
            },
        },
        resetOnSubmit: {
            control: "boolean",
            description: "Whether to reset the input after submit",
            table: {
                type: {
                    summary: "boolean",
                },
                defaultValue: {
                    summary: "true",
                },
            },
        },
        multipleFiles: {
            control: "boolean",
            description: "Whether to allow multiple file selection",
            table: {
                type: {
                    summary: "boolean",
                },
                defaultValue: {
                    summary: "false",
                },
            },
        },
        maxFileSize: {
            control: "number",
            description: "Maximum file size in bytes",
            table: {
                type: {
                    summary: "number",
                },
            },
        },
        acceptedFileTypes: {
            control: "object",
            description:
                "Array of accepted file types (MIME types or extensions)",
            table: {
                type: {
                    summary: "readonly string[]",
                },
            },
        },
        isFileButtonVisible: {
            control: "boolean",
            description: "Whether the file button is visible",
            table: {
                type: {
                    summary: "boolean",
                },
                defaultValue: {
                    summary: "true",
                },
            },
        },
        isSubmitButtonVisible: {
            control: "boolean",
            description: "Whether the submit button is visible",
            table: {
                type: {
                    summary: "boolean",
                },
                defaultValue: {
                    summary: "true",
                },
            },
        },
        isStopButtonVisible: {
            control: "boolean",
            description: "Whether the stop button is visible",
            table: {
                type: {
                    summary: "boolean",
                },
                defaultValue: {
                    summary: "true",
                },
            },
        },
        isCancelButtonVisible: {
            control: "boolean",
            description: "Whether the cancel button is visible",
            table: {
                type: {
                    summary: "boolean",
                },
                defaultValue: {
                    summary: "true",
                },
            },
        },
        isUpdateButtonVisible: {
            control: "boolean",
            description: "Whether the update button is visible",
            table: {
                type: {
                    summary: "boolean",
                },
                defaultValue: {
                    summary: "true",
                },
            },
        },
        isLoadingFiles: {
            control: "boolean",
            description: "Whether files are currently loading",
            table: {
                type: {
                    summary: "boolean",
                },
            },
        },
        className: {
            control: "text",
            description: "Additional CSS classes for the form container",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        classNameTextarea: {
            control: "text",
            description: "Additional CSS classes for the textarea",
            table: {
                type: {
                    summary: "string",
                },
            },
        },
        onSubmit: {
            control: false,
            description: "Callback function called when form is submitted",
            table: {
                type: {
                    summary: "(text: string) => void",
                },
            },
        },
        onFileSelect: {
            control: false,
            description: "Callback function called when files are selected",
            table: {
                type: {
                    summary: "(files: File[]) => void",
                },
            },
        },
        onFilePaste: {
            control: false,
            description: "Callback function called when files are pasted",
            table: {
                type: {
                    summary: "(files: File[]) => void",
                },
            },
        },
        onCancel: {
            control: false,
            description: "Callback function called when cancel is clicked",
            table: {
                type: {
                    summary: "() => void",
                },
            },
        },
        onStop: {
            control: false,
            description: "Callback function called when stop is clicked",
            table: {
                type: {
                    summary: "() => void",
                },
            },
        },
    },
});

export const Default = meta.story({
    args: {
        variant: "submit",
    },
});

Default.test("should render textarea and submit button", async ({ canvas }) => {
    const textarea = canvas.getByPlaceholderText("Send a message...");
    expect(textarea).toBeVisible();

    const submitButton = canvas.getByRole("button", { name: /send/i });
    expect(submitButton).toBeVisible();
});

Default.test("should auto focus on textarea", async ({ canvas }) => {
    const textarea = canvas.getByPlaceholderText("Send a message...");
    expect(textarea).toBeVisible();
    expect(textarea).toHaveFocus();
});

Default.test(
    "should call onSubmit when form is submitted",
    async ({ canvas, args }) => {
        const textarea = canvas.getByPlaceholderText("Send a message...");
        await userEvent.type(textarea, "Test message");

        const form = textarea.closest("form");
        expect(form).toBeInTheDocument();

        const submitButton = canvas.getByRole("button", { name: /send/i });
        await userEvent.click(submitButton);

        expect(args.onSubmit).toHaveBeenCalledWith("Test message");
    },
);

Default.test(
    "should call onSubmit when form is submitted using enter key",
    async ({ canvas, args }) => {
        const textarea = canvas.getByRole("textbox");
        await userEvent.type(textarea, "Test message");
        await userEvent.type(textarea, "{enter}");

        await waitFor(() => {
            expect(args.onSubmit).toHaveBeenCalledWith("Test message");
        });
    },
);

Default.test(
    "should reset input after submit when resetOnSubmit is true",
    async ({ canvas }) => {
        const textarea = canvas.getByPlaceholderText(
            "Send a message...",
        ) as HTMLTextAreaElement;
        await userEvent.type(textarea, "Test message");

        const submitButton = canvas.getByRole("button", { name: /send/i });
        await userEvent.click(submitButton);

        expect(textarea.value).toBe("");
    },
);

Default.test(
    "should call onFileSelect when file is selected",
    async ({ args }) => {
        const fileInput = getFileInput();
        expect(fileInput).toBeInTheDocument();

        const mockFile = new File(["test content"], "test-file.txt", {
            type: "text/plain",
        });

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(mockFile);

        Object.defineProperty(fileInput, "files", {
            value: dataTransfer.files,
            writable: false,
            configurable: true,
        });

        const changeEvent = new Event("change", { bubbles: true });
        fileInput.dispatchEvent(changeEvent);

        await waitFor(() => {
            expect(args.onFileSelect).toHaveBeenCalledWith([mockFile]);
        });
    },
);

Default.test(
    "should call onFilePaste when file is pasted",
    async ({ canvas, args }) => {
        const textarea = canvas.getByRole("textbox") as HTMLTextAreaElement;
        expect(textarea).toBeInTheDocument();

        const file1 = new File(["content1"], "test-file-1.txt", {
            type: "text/plain",
        });
        const file2 = new File(["content2"], "test-file-2.jpg", {
            type: "image/jpeg",
        });

        const mockItems = [
            {
                kind: "file" as const,
                type: file1.type,
                getAsFile: () => file1,
            },
            {
                kind: "file" as const,
                type: file2.type,
                getAsFile: () => file2,
            },
        ];

        const pasteEvent = new ClipboardEvent("paste", {
            bubbles: true,
            cancelable: true,
        });

        const mockClipboardData = {
            items: mockItems,
            files: [file1, file2],
            types: ["Files"],
        } as unknown as DataTransfer;

        Object.defineProperty(pasteEvent, "clipboardData", {
            value: mockClipboardData,
            writable: false,
            configurable: true,
        });

        textarea.dispatchEvent(pasteEvent);

        await waitFor(() => {
            expect(args.onFilePaste).toHaveBeenCalledWith([file1, file2]);
        });
    },
);

export const WithInitialValue = meta.story({
    args: {
        defaultValue: "This is a pre-filled message",
    },
});

WithInitialValue.test("should display initial value", async ({ canvas }) => {
    const textarea = canvas.getByDisplayValue("This is a pre-filled message");
    expect(textarea).toBeVisible();
});

export const UpdateVariant = meta.story({
    args: {
        variant: "update",
    },
});

UpdateVariant.test(
    "should show update and cancel buttons in update variant",
    async ({ canvas }) => {
        const updateButton = canvas.getByRole("button", { name: /update/i });
        expect(updateButton).toBeVisible();

        const cancelButton = canvas.getByRole("button", { name: /cancel/i });
        expect(cancelButton).toBeVisible();
    },
);

UpdateVariant.test(
    "should not show submit button in update variant",
    async ({ canvas }) => {
        const submitButton = canvas.queryByRole("button", { name: /send/i });
        expect(submitButton).not.toBeInTheDocument();
    },
);

UpdateVariant.test(
    "should not show file button in update variant",
    async ({ canvas }) => {
        const fileButton = canvas.queryByRole("button", {
            name: /attach|file/i,
        });
        expect(fileButton).not.toBeInTheDocument();
    },
);

UpdateVariant.test(
    "should call onSubmit when form is submitted",
    async ({ canvas, args }) => {
        const textarea = canvas.getByPlaceholderText("Send a message...");
        await userEvent.type(textarea, "Test message");

        const form = textarea.closest("form");
        expect(form).toBeInTheDocument();

        const updateButton = canvas.getByRole("button", { name: /update/i });
        await userEvent.click(updateButton);

        expect(args.onSubmit).toHaveBeenCalledWith("Test message");
    },
);

UpdateVariant.test(
    "should call onSubmit when form is submitted using enter key",
    async ({ canvas, args }) => {
        const textarea = canvas.getByRole("textbox");

        await userEvent.type(textarea, "Test message");
        await userEvent.type(textarea, "{enter}");

        await waitFor(() => {
            expect(args.onSubmit).toHaveBeenCalledWith("Test message");
        });
    },
);

UpdateVariant.test(
    "should reset input after submit when resetOnSubmit is true",
    async ({ canvas }) => {
        const textarea = canvas.getByPlaceholderText(
            "Send a message...",
        ) as HTMLTextAreaElement;
        await userEvent.type(textarea, "Test message");

        const updateButton = canvas.getByRole("button", { name: /update/i });
        await userEvent.click(updateButton);

        expect(textarea.value).toBe("");
    },
);

UpdateVariant.test(
    "should call onCancel when cancel button is clicked",
    async ({ canvas, args }) => {
        const cancelButton = canvas.getByRole("button", { name: /cancel/i });
        await userEvent.click(cancelButton);

        await waitFor(() => {
            expect(args.onCancel).toHaveBeenCalled();
        });
    },
);

export const StatusSubmitted = meta.story({
    args: {
        status: "submitted" as ChatStatus,
    },
});

StatusSubmitted.test(
    "should show stop button when streaming",
    async ({ canvas }) => {
        const stopButton = canvas.getByRole("button", { name: /stop/i });
        expect(stopButton).toBeVisible();
    },
);

StatusSubmitted.test(
    "should not show submit button when status is submitted",
    async ({ canvas }) => {
        const submitButton = canvas.queryByRole("button", { name: /send/i });
        expect(submitButton).not.toBeInTheDocument();
    },
);

export const StatusStreaming = meta.story({
    args: {
        status: "streaming" as ChatStatus,
    },
});

StatusStreaming.test(
    "should show stop button when streaming",
    async ({ canvas }) => {
        const stopButton = canvas.getByRole("button", { name: /stop/i });
        expect(stopButton).toBeVisible();
    },
);

StatusStreaming.test(
    "should not show submit button when streaming",
    async ({ canvas }) => {
        const submitButton = canvas.queryByRole("button", { name: /send/i });
        expect(submitButton).not.toBeInTheDocument();
    },
);

StatusStreaming.test(
    "should call onStop when stop button is clicked",
    async ({ canvas, args }) => {
        const stopButton = canvas.getByRole("button", { name: /stop/i });
        await userEvent.click(stopButton);

        await waitFor(() => {
            expect(args.onStop).toHaveBeenCalled();
        });
    },
);

export const WithMinLength = meta.story({
    args: {
        min: 10,
        placeholder: "Type at least 10 characters...",
    },
});

WithMinLength.test(
    "should disable submit button when text is below minimum length",
    async ({ canvas }) => {
        const textarea = canvas.getByPlaceholderText(
            "Type at least 10 characters...",
        );
        await userEvent.type(textarea, "Short");

        const submitButton = canvas.getByRole("button", { name: /send/i });
        expect(submitButton).toBeDisabled();
    },
);

WithMinLength.test(
    "should enable submit button when text meets minimum length",
    async ({ canvas }) => {
        const textarea = canvas.getByPlaceholderText(
            "Type at least 10 characters...",
        );
        await userEvent.type(textarea, "This is long enough");

        const submitButton = canvas.getByRole("button", { name: /send/i });
        expect(submitButton).not.toBeDisabled();
    },
);

export const WithMaxLength = meta.story({
    args: {
        max: 50,
        placeholder: "Type up to 50 characters...",
    },
});

WithMaxLength.test(
    "should disable submit button when text exceeds maximum length",
    async ({ canvas }) => {
        const textarea = canvas.getByPlaceholderText(
            "Type up to 50 characters...",
        );
        await userEvent.type(
            textarea,
            "This is a very long message that exceeds the maximum length of 50 characters",
        );

        const submitButton = canvas.getByRole("button", { name: /send/i });
        expect(submitButton).toBeDisabled();
    },
);

export const WithMinAndMaxLength = meta.story({
    args: {
        min: 5,
        max: 100,
        placeholder: "Type between 5 and 100 characters...",
    },
});

WithMinAndMaxLength.test(
    "should disable submit when text is below minimum",
    async ({ canvas }) => {
        const textarea = canvas.getByPlaceholderText(
            "Type between 5 and 100 characters...",
        );
        await userEvent.type(textarea, "Hi");

        const submitButton = canvas.getByRole("button", { name: /send/i });
        expect(submitButton).toBeDisabled();
    },
);

WithMinAndMaxLength.test(
    "should disable submit when text exceeds maximum",
    async ({ canvas }) => {
        const textarea = canvas.getByPlaceholderText(
            "Type between 5 and 100 characters...",
        );
        await userEvent.type(
            textarea,
            "This is a very long message that exceeds the maximum length of 100 characters and should disable the submit button",
        );

        const submitButton = canvas.getByRole("button", { name: /send/i });
        expect(submitButton).toBeDisabled();
    },
);

WithMinAndMaxLength.test(
    "should enable submit when text is within min and max",
    async ({ canvas }) => {
        const textarea = canvas.getByPlaceholderText(
            "Type between 5 and 100 characters...",
        );
        await userEvent.type(textarea, "This is valid text");

        const submitButton = canvas.getByRole("button", { name: /send/i });
        expect(submitButton).not.toBeDisabled();
    },
);

export const Disabled = meta.story({
    args: {
        disabled: true,
        defaultValue: "This composer is disabled",
    },
});

Disabled.test(
    "should disable textarea and submit button when disabled",
    async ({ canvas }) => {
        const submitButton = canvas.getByRole("button", { name: /send/i });
        expect(submitButton).toBeDisabled();
    },
);

Disabled.test(
    "should not call onSubmit when disabled and submit button is clicked",
    async ({ canvas, args }) => {
        const submitButton = canvas.getByRole("button", { name: /send/i });
        expect(submitButton).toBeDisabled();

        try {
            await userEvent.click(submitButton);
        } catch (error) {
            expect(args.onSubmit).not.toHaveBeenCalled();
            expect(error).toBeInstanceOf(Error);
        }
    },
);

Disabled.test(
    "should not call onSubmit when disabled and enter key is pressed",
    async ({ canvas, args }) => {
        const textarea = canvas.getByRole("textbox");

        await userEvent.type(textarea, "{enter}");

        expect(args.onSubmit).not.toHaveBeenCalled();
    },
);

export const DisabledFileButton = meta.story({
    args: {
        disabledFileButton: true,
    },
});

DisabledFileButton.test(
    "should not call onFileSelect when disabled and file button is clicked",
    async ({ canvas, args }) => {
        const fileButton = canvas.getByRole("button", { name: /attach|file/i });
        expect(fileButton).toBeDisabled();

        try {
            await userEvent.click(fileButton);
        } catch (error) {
            expect(args.onFileSelect).not.toHaveBeenCalled();
            expect(error).toBeInstanceOf(Error);
        }
    },
);

export const WithoutFileButton = meta.story({
    args: {
        isFileButtonVisible: false,
    },
});

WithoutFileButton.test(
    "should not show file button when isFileButtonVisible is false",
    async ({ canvas }) => {
        const fileButton = canvas.queryByRole("button", {
            name: /attach|file/i,
        });
        expect(fileButton).not.toBeInTheDocument();
    },
);

export const WithoutCancelButton = meta.story({
    args: {
        variant: "update",
        isCancelButtonVisible: false,
    },
});

WithoutCancelButton.test(
    "should not show cancel button when isCancelButtonVisible is false",
    async ({ canvas }) => {
        const cancelButton = canvas.queryByRole("button", { name: /cancel/i });
        expect(cancelButton).not.toBeInTheDocument();
    },
);

export const WithoutUpdateButton = meta.story({
    args: {
        variant: "update",
        isUpdateButtonVisible: false,
    },
});

WithoutUpdateButton.test(
    "should not show update button when isUpdateButtonVisible is false",
    async ({ canvas }) => {
        const updateButton = canvas.queryByRole("button", { name: /update/i });
        expect(updateButton).not.toBeInTheDocument();
    },
);

export const MultipleFiles = meta.story({
    args: {
        multipleFiles: true,
    },
});

MultipleFiles.test(
    "should call onFileSelect with multiple files when multiple files are selected",
    async ({ args }) => {
        const fileInput = getFileInput();
        expect(fileInput).toBeInTheDocument();

        const file1 = new File(["content1"], "test-file-1.txt", {
            type: "text/plain",
        });
        const file2 = new File(["content2"], "test-file-2.txt", {
            type: "text/plain",
        });
        const file3 = new File(["content3"], "test-file-3.jpg", {
            type: "image/jpeg",
        });

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file1);
        dataTransfer.items.add(file2);
        dataTransfer.items.add(file3);

        Object.defineProperty(fileInput, "files", {
            value: dataTransfer.files,
            writable: false,
            configurable: true,
        });

        const changeEvent = new Event("change", { bubbles: true });
        fileInput.dispatchEvent(changeEvent);

        await waitFor(() => {
            expect(args.onFileSelect).toHaveBeenCalledWith([
                file1,
                file2,
                file3,
            ]);
        });
    },
);

export const WithFileTypes = meta.story({
    args: {
        acceptedFileTypes: ["image/*", ".pdf", ".txt"],
    },
});

WithFileTypes.test(
    "should call onFileSelect with correct file types when file is selected",
    async ({ args }) => {
        const fileInput = getFileInput();
        expect(fileInput).toBeInTheDocument();

        const imageFile = new File(["image content"], "test-image.jpg", {
            type: "image/jpeg",
        });
        const pdfFile = new File(["pdf content"], "test-document.pdf", {
            type: "application/pdf",
        });
        const txtFile = new File(["text content"], "test-file.txt", {
            type: "text/plain",
        });

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(imageFile);
        dataTransfer.items.add(pdfFile);
        dataTransfer.items.add(txtFile);

        Object.defineProperty(fileInput, "files", {
            value: dataTransfer.files,
            writable: false,
            configurable: true,
        });

        const changeEvent = new Event("change", { bubbles: true });
        fileInput.dispatchEvent(changeEvent);

        await waitFor(() => {
            expect(args.onFileSelect).toHaveBeenCalledWith([
                imageFile,
                pdfFile,
                txtFile,
            ]);
        });
    },
);
WithFileTypes.test("should have accept attribute set correctly", async () => {
    const fileInput = getFileInput();
    expect(fileInput).toBeInTheDocument();
    expect(fileInput?.accept).toBe("image/*,.pdf,.txt");
});

export const WithMaxFileSize = meta.story({
    args: {
        maxFileSize: 5 * 1024 * 1024, // 5MB
    },
});

WithMaxFileSize.test(
    "should have max attribute set on file input",
    async () => {
        const fileInput = getFileInput();
        expect(fileInput).toBeInTheDocument();

        expect(fileInput.getAttribute("max")).toBe("5242880"); // 5MB in bytes
    },
);

WithMaxFileSize.test(
    "should call onFileSelect with file within size limit",
    async ({ args }) => {
        const fileInput = getFileInput();
        expect(fileInput).toBeInTheDocument();

        const validFile = new File(
            [new ArrayBuffer(1024 * 1024)], // 1MB
            "test-file.txt",
            { type: "text/plain" },
        );

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(validFile);

        Object.defineProperty(fileInput, "files", {
            value: dataTransfer.files,
            writable: false,
            configurable: true,
        });

        const changeEvent = new Event("change", { bubbles: true });
        fileInput.dispatchEvent(changeEvent);

        await waitFor(() => {
            expect(args.onFileSelect).toHaveBeenCalledWith([validFile]);
        });
    },
);

export const WithoutAutoFocus = meta.story({
    args: {
        autoFocus: false,
    },
});

WithoutAutoFocus.test(
    "should not focus textarea when autoFocus is false",
    async ({ canvas }) => {
        const textarea = canvas.getByRole("textbox");
        expect(textarea).not.toHaveFocus();
    },
);

export const WithoutResetOnSubmit = meta.story({
    args: {
        resetOnSubmit: false,
    },
});

WithoutResetOnSubmit.test(
    "should not reset input after submit when resetOnSubmit is false",
    async ({ canvas }) => {
        const textarea = canvas.getByRole("textbox") as HTMLTextAreaElement;
        await userEvent.type(textarea, "Test message");

        const submitButton = canvas.getByRole("button", { name: /send/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(textarea.value).toBe("Test message");
        });
    },
);

export const AllButtonsHidden = meta.story({
    args: {
        isFileButtonVisible: false,
        isSubmitButtonVisible: false,
        isStopButtonVisible: false,
        isCancelButtonVisible: false,
        isUpdateButtonVisible: false,
    },
});
