import * as cheerio from "cheerio";

const BASE_URL = "https://darknaija.com";
const HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

export interface ScrapedVideo {
    title: string;
    postUrl: string;
    videoUrl: string;
    thumbnail?: string;
}

/** Scrape a single DarkNaija post page and extract the direct .mp4 download link */
export async function scrapeDarknaijaPage(postUrl: string): Promise<ScrapedVideo | null> {
    try {
        const res = await fetch(postUrl, { headers: HEADERS, cache: "no-store" });
        if (!res.ok) return null;

        const html = await res.text();
        const $ = cheerio.load(html);

        const title =
            $("h1").first().text().trim() ||
            $("title").text().replace(/\s*[–-]\s*DarkNaija.*/i, "").trim() ||
            "Untitled";

        // Prefer the DOWNLOAD VIDEO button, then any cdn-darknaija .mp4, then <video>/<source>
        let videoUrl =
            $("a")
                .filter((_, el) => $(el).text().toUpperCase().includes("DOWNLOAD VIDEO"))
                .first()
                .attr("href") ||
            $("a[href*='cdn-darknaija.com'][href$='.mp4']").attr("href") ||
            $("video source").attr("src") ||
            $("video").attr("src") ||
            null;

        if (!videoUrl) return null;

        // Make absolute if needed
        if (videoUrl.startsWith("/")) {
            videoUrl = `https://cdn-darknaija.com${videoUrl}`;
        } else if (!videoUrl.startsWith("http")) {
            videoUrl = new URL(videoUrl, BASE_URL).href;
        }

        const thumbnail =
            $('meta[property="og:image"]').attr("content") ||
            $("img").first().attr("src") ||
            undefined;

        return {
            title,
            postUrl,
            videoUrl,
            thumbnail,
        };
    } catch (err) {
        console.error("[scraper-darknaija] page error:", err);
        return null;
    }
}

/** Scrape multiple posts from a category (default: leak-videos) */
export async function scrapeDarknaijaCategory(
    categoryUrl = "https://darknaija.com/category/leak-videos/",
    maxPages = 1
): Promise<ScrapedVideo[]> {
    const results: ScrapedVideo[] = [];
    const seen = new Set<string>();

    for (let page = 1; page <= maxPages; page++) {
        const url = page === 1 ? categoryUrl : `${categoryUrl.replace(/\/$/, "")}/page/${page}/`;

        try {
            const res = await fetch(url, { headers: HEADERS, cache: "no-store" });
            if (!res.ok) continue;

            const html = await res.text();
            const $ = cheerio.load(html);

            const postLinks: string[] = [];
            $("h2 a, h3 a, .entry-title a, article a, a[href*='/20']").each((_, el) => {
                const href = $(el).attr("href");
                if (href && /\/20\d{2}\//.test(href) && !href.includes("/category/")) {
                    const full = href.startsWith("http") ? href : new URL(href, BASE_URL).href;
                    if (!seen.has(full)) {
                        seen.add(full);
                        postLinks.push(full);
                    }
                }
            });

            for (const post of postLinks) {
                const video = await scrapeDarknaijaPage(post);
                if (video) results.push(video);

                // Polite delay
                await new Promise((r) => setTimeout(r, 1200));
            }
        } catch (err) {
            console.error(`[scraper-darknaija] category page ${page} error:`, err);
        }

        // Delay between pages
        if (page < maxPages) {
            await new Promise((r) => setTimeout(r, 2000));
        }
    }

    return results;
}