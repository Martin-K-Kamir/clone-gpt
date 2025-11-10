import { ChatViewBodySkeleton } from "@/features/chat/components/chat-view-body";
import { ChatViewHeaderSkeleton } from "@/features/chat/components/chat-view-header";

export default function Loading() {
    return (
        <>
            <ChatViewHeaderSkeleton showActions={true} />
            <ChatViewBodySkeleton />
        </>
    );
}
