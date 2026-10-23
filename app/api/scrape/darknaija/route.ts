import { NextRequest, NextResponse } from "next/server";
import { scrapeDarknaijaCategory } from "@/lib/scraper-darknaija";
import { requireAdmin } from "@/lib/server-auth";

export async function GET(req: NextRequest) {
    // Only admin can trigger the scraper
    const admin = await requireAdmin(req);
    if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const pages = Math.min(Number(searchParams.get("pages") || 1), 3); // hard safety limit
    const category =
        searchParams.get("category") ||
        "https://darknaija.com/category/leak-videos/";

    try {
        const videos = await scrapeDarknaijaCategory(category, pages);

        return NextResponse.json({
            success: true,
            count: videos.length,
            videos,
        });
    } catch (error) {
        console.error("[api/scrape/darknaija]", error);
        return NextResponse.json(
            { success: false, error: "Scraping failed" },
            { status: 500 }
        );
    }
}