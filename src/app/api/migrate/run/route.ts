import { NextRequest, NextResponse } from "next/server";
import { migrateWpPost, type MigrateTarget } from "@/lib/wpMigration";

export const maxDuration = 60;

type Body = {
  siteUrl: string;
  wpPostId: number;
  category: string;
  referenceField?: MigrateTarget["referenceField"];
  referenceId?: string;
  publish?: boolean;
  images?: Record<string, string>;
};

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.siteUrl || !body.wpPostId || !body.category) {
    return NextResponse.json({ error: "siteUrl, wpPostId, and category are required" }, { status: 400 });
  }

  try {
    const result = await migrateWpPost(
      body.siteUrl,
      body.wpPostId,
      {
        category: body.category,
        referenceField: body.referenceField,
        referenceId: body.referenceId,
        publish: body.publish,
      },
      body.images
    );
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Migration failed" }, { status: 500 });
  }
}
