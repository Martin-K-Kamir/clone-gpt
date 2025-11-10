import { STORAGE_BUCKET } from "@/features/chat/lib/constants";

export type StorageBucket =
    (typeof STORAGE_BUCKET)[keyof typeof STORAGE_BUCKET];
