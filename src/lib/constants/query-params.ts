import { objectValuesToTuple } from "@/lib/utils/object-values-to-tuple/object-values-to-tuple";

export const ORDER_BY = {
    CREATED_AT: "createdAt",
    UPDATED_AT: "updatedAt",
} as const;

export const ORDER_BY_LIST = objectValuesToTuple(ORDER_BY);
