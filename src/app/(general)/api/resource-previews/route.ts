import * as cheerio from "cheerio";
import { NextRequest, NextResponse } from "next/server";

function resolveUrl(base: string, path: string) {
    try {
        return new URL(path, base).toString();
    } catch {
        return "";
    }
}

function createFallbackResult(url: string) {
    try {
        const { hostname } = new URL(url);
        const cleanHostname = hostname.replace(/^www\./, "");
        const siteName =
            cleanHostname.charAt(0).toUpperCase() + cleanHostname.slice(1);

        return {
            url,
            title: siteName,
            description:
                "Content preview unavailable due to access restrictions.",
            siteName,
            image: "",
            favicon: `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`,
        };
    } catch {
        return {
            url,
            title: "Unknown Site",
            description: "Content preview unavailable.",
            siteName: "Unknown",
            image: "",
            favicon: "",
        };
    }
}

async function scrapeUrl(url: string) {
    try {
        await new Promise(resolve =>
            setTimeout(resolve, Math.random() * 1000 + 500),
        );

        const response = await fetch(url, {
            cache: "no-store",
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
                "Accept-Language": "en-US,en;q=0.5",
                "Accept-Encoding": "gzip, deflate, br",
                DNT: "1",
                Connection: "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                "Sec-Fetch-Dest": "document",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-Site": "none",
                "Cache-Control": "max-age=0",
            },
            redirect: "follow",
            signal: AbortSignal.timeout(10000),
        });

        if (response.status === 403 || response.status === 429) {
            console.warn(
                `Bot protection detected for ${url}: ${response.status}`,
            );
            return createFallbackResult(url);
        }

        if (!response.ok) {
            console.warn(`Failed to fetch ${url}: ${response.status}`);
            return createFallbackResult(url);
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        const { hostname } = new URL(url);
        const cleanHostname = hostname.replace(/^www\./, "");

        const title =
            $("meta[property='og:title']").attr("content") ||
            $("meta[name='twitter:title']").attr("content") ||
            $("title").text().trim() ||
            "";

        const description =
            $("meta[property='og:description']").attr("content") ||
            $("meta[name='twitter:description']").attr("content") ||
            $('meta[name="description"]').attr("content") ||
            $("p").first().text().trim().substring(0, 160) ||
            "";

        const image =
            $("meta[property='og:image']").attr("content") ||
            $("meta[name='twitter:image']").attr("content") ||
            "";

        const favicon =
            $('link[rel="icon"]').attr("href") ||
            $('link[rel="shortcut icon"]').attr("href") ||
            $('link[rel="apple-touch-icon"]').attr("href") ||
            "/favicon.ico";

        const siteName =
            $("meta[property='og:site_name']").attr("content") ||
            $("meta[name='application-name']").attr("content") ||
            cleanHostname.charAt(0).toUpperCase() + cleanHostname.slice(1) ||
            "";

        return {
            url,
            title: title.substring(0, 200),
            description: description.substring(0, 300),
            siteName,
            image: image ? resolveUrl(url, image) : "",
            favicon: favicon ? resolveUrl(url, favicon) : "",
        };
    } catch (error) {
        console.warn(`Error scraping ${url}:`, error);
        return createFallbackResult(url);
    }
}

export async function POST(req: NextRequest) {
    const { urls } = await req.json();

    if (!Array.isArray(urls)) {
        return NextResponse.json(
            { error: "urls must be an array" },
            { status: 400 },
        );
    }

    const results = await Promise.all(urls.map(url => scrapeUrl(url)));
    const filteredResults = results.filter(result => result !== null);
    return NextResponse.json(filteredResults);
}
