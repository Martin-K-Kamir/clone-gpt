import { createHash } from "crypto";

export function hashId(id: string): string {
    return createHash("sha256").update(id).digest("hex").substring(0, 16);
}
