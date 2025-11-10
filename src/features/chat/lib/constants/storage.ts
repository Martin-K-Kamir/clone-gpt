import { objectValuesToTuple } from "@/lib/utils";

export const STORAGE_BUCKET = {
    GENERATED_IMAGES: "generated-images",
    GENERATED_FILES: "generated-files",
    USER_FILES: "user-files",
} as const;

export const STORAGE_BUCKETS_LIST = objectValuesToTuple(STORAGE_BUCKET);
