import { NextRequest, NextResponse } from "next/server";
import { uploadSingleImage, assertAllowedHost } from "@/lib/wpMigration";

export async function POST(req: NextRequest) {
  let body: { src?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.src) {
    return NextResponse.json({ error: "src is required" }, { status: 400 });
  }

  let parsed: URL;
  try {
    parsed = new URL(body.src);
    assertAllowedHost(parsed.hostname);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Invalid src" }, { status: 400 });
  }

  try {
    const assetId = await uploadSingleImage(body.src);
    return NextResponse.json({ src: body.src, assetId });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Upload failed" }, { status: 500 });
  }
}
