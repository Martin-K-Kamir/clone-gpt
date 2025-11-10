import {
    PromptComposer,
    type PromptComposerProps,
} from "@/components/ui/prompt-composer";

import {
    CHAT_ACCEPTED_FILES,
    CHAT_ACCEPTED_FILE_SIZE,
    CHAT_CHARACTER_MAX_LIMIT,
    CHAT_CHARACTER_MIN_LIMIT,
} from "@/features/chat/lib/constants";
import {
    useChatFilesContext,
    useChatFilesRateLimitContext,
    useChatHandlersContext,
    useChatMessagesRateLimitContext,
    useChatStatusContext,
} from "@/features/chat/providers/chat-provider";

export function ChatComposerPrompt(props: PromptComposerProps) {
    const { status, isStreaming, isSubmitted } = useChatStatusContext();
    const { isUploadingFiles, handleFileSelect } = useChatFilesContext();
    const { handleSendMessage, handleStop } = useChatHandlersContext();
    const { rateLimit: chatMessagesRateLimit } =
        useChatMessagesRateLimitContext();
    const { rateLimit: chatFilesRateLimit } = useChatFilesRateLimitContext();

    const isDisabled =
        isStreaming ||
        isSubmitted ||
        isUploadingFiles ||
        chatMessagesRateLimit?.isOverLimit;

    const isDisabledFileButton = isDisabled || chatFilesRateLimit?.isOverLimit;

    return (
        <PromptComposer
            multipleFiles
            status={status}
            disabled={isDisabled}
            disabledFileButton={isDisabledFileButton}
            min={CHAT_CHARACTER_MIN_LIMIT}
            max={CHAT_CHARACTER_MAX_LIMIT}
            maxFileSize={CHAT_ACCEPTED_FILE_SIZE}
            acceptedFileTypes={CHAT_ACCEPTED_FILES}
            onSubmit={handleSendMessage}
            onStop={handleStop}
            onFileSelect={handleFileSelect}
            onFilePaste={handleFileSelect}
            {...props}
        />
    );
}
