import type { ORDER_BY_LIST } from "@/lib/constants/query-params";

export type OrderBy = (typeof ORDER_BY_LIST)[number];
