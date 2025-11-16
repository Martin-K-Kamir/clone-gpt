import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    experimental: {
        cacheComponents: true,
        serverActions: {
            bodySizeLimit: "15mb",
        },
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: process.env.SUPABASE_DOMAIN!,
                port: "",
                pathname: "/storage/v1/object/public/**",
            },
        ],
    },
    poweredByHeader: false,
};

export default nextConfig;
