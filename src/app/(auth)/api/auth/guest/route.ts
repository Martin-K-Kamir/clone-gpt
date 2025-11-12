import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { signIn } from "@/features/auth/services/auth";

export const preferredRegion = "fra1";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const redirectUrl = searchParams.get("redirectUrl") || "/";

    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET,
    });

    if (token) {
        return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    return signIn("guest", { redirect: true, redirectTo: redirectUrl });
}
