import { objectValuesToTuple } from "@/lib/utils/object-values-to-tuple/object-values-to-tuple";

export const SIZE = {
    XS: "xs",
    SM: "sm",
    MD: "md",
    LG: "lg",
    XL: "xl",
    XL2: "2xl",
    XL3: "3xl",
} as const;

export const SIZES_LIST = objectValuesToTuple(SIZE);
