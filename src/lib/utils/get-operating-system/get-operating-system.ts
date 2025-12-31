import type { OperatingSystem } from "@/lib/types";

export function getOperatingSystem(userAgent?: string): OperatingSystem | null {
    if (typeof window !== "undefined") {
        userAgent = userAgent || window.navigator.userAgent;
    }

    if (!userAgent) return null;

    if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) {
        return "macOS";
    }

    if (/iPhone|iPad|iPod/.test(userAgent)) {
        return "iOS";
    }

    if (/Win32|Win64|Windows|WinCE/.test(userAgent)) {
        return "windows";
    }

    if (/Android/.test(userAgent)) {
        return "android";
    }

    if (/Linux/.test(userAgent)) {
        return "linux";
    }

    return null;
}
