import { NextRequest, NextResponse } from "next/server";
import { resolveCategoryFromUrl, listPostsInCategory, markAlreadyMigrated } from "@/lib/wpMigration";

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return NextResponse.json({ error: "URL must be http or https" }, { status: 400 });
  }

  try {
    const { siteUrl, categoryId, categoryName } = await resolveCategoryFromUrl(url);
    const rawPosts = await listPostsInCategory(siteUrl, categoryId);
    const posts = await markAlreadyMigrated(rawPosts);
    return NextResponse.json({ siteUrl, categoryName, posts });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to fetch" }, { status: 500 });
  }
}
