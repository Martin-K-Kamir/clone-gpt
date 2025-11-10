import { NextResponse } from "next/server";

import { auth } from "@/features/auth/services/auth";

export default auth(async req => {
    if (
        !req.auth &&
        !["/api/auth", "/login", "/logout", "/signin", "/signup"].includes(
            req.nextUrl.pathname,
        )
    ) {
        const url = new URL("/api/auth/guest", req.nextUrl.origin);
        url.searchParams.set("redirectUrl", req.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    if (req.nextUrl.pathname === "/chat" || req.nextUrl.pathname === "/chat/") {
        return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
