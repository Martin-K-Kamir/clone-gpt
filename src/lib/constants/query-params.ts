import { objectValuesToTuple } from "@/lib/utils";

export const ORDER_BY = {
    CREATED_AT: "createdAt",
    UPDATED_AT: "updatedAt",
} as const;

export const ORDER_BY_LIST = objectValuesToTuple(ORDER_BY);
