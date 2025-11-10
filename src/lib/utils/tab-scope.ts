import type { TabScope } from "@/lib/types";

export function tabScope(
    scope: TabScope = "both",
    handlers: { thisTab?: () => void; otherTabs?: () => void },
) {
    if (scope === "thisTab" || scope === "both") handlers.thisTab?.();
    if (scope === "otherTabs" || scope === "both") handlers.otherTabs?.();
}
