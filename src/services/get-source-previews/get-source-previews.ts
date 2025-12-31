import { SourcePreview } from "@/lib/types";

export async function getSourcePreviews(urls: string[]) {
    const res = await fetch("/api/resource-previews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
    });

    if (!res.ok) throw new Error("Failed to fetch previews");
    const data = await res.json();

    return data.filter(Boolean) as SourcePreview[];
}
