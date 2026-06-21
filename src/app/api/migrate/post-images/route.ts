import { NextRequest, NextResponse } from "next/server";
import { getWpPostImageSrcs } from "@/lib/wpMigration";

export async function GET(req: NextRequest) {
  const siteUrl = req.nextUrl.searchParams.get("siteUrl");
  const wpPostId = Number(req.nextUrl.searchParams.get("wpPostId"));
  if (!siteUrl || !wpPostId) {
    return NextResponse.json({ error: "siteUrl and wpPostId are required" }, { status: 400 });
  }

  try {
    const srcs = await getWpPostImageSrcs(siteUrl, wpPostId);
    return NextResponse.json({ srcs });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed to list images" }, { status: 500 });
  }
}
