import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import nodemailer from "nodemailer";
import { getSanityWriteClient } from "@/lib/sanityWriteClient";
import { getSiteSettings, getContactRecipients } from "@/lib/siteSettings";
import { escapeHtml } from "@/lib/escapeHtml";
import { key, plainTextBlock, slugify, textToBlocks } from "@/lib/portableText";

export const maxDuration = 30;

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB
const MAX_IMAGES = 6;

function safeCompare(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

interface SyncPayload {
  sourceId?: string;
  author?: string;
  isAnonymous?: boolean;
  church?: string;
  testimonyBody?: string;
  linkedPrayerBody?: string | null;
  images?: string[];
}

function titleFromBody(body: string): string {
  const firstLine = body.split(/\n+/).find((line) => line.trim().length > 0) ?? body;
  const trimmed = firstLine.trim();
  return trimmed.length > 60 ? `${trimmed.slice(0, 57)}…` : trimmed || "A Testimony";
}

// System-to-system counterpart to /api/share-story: ccsgm-connect calls this
// once an elder approves a member's testimony for public sharing. Creates
// the exact same shape of pending Sanity draft the public "Share Your Story"
// form produces, so it lands in Studio's "📬 Story Submissions" queue and
// gets reviewed the same way.
export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-ccsgm-sync-secret");
  const expectedSecret = process.env.WEBSITE_SYNC_SECRET;
  if (!secret || !expectedSecret || !safeCompare(secret, expectedSecret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: SyncPayload;
  try {
    payload = (await req.json()) as SyncPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const sourceId = payload.sourceId?.trim();
  const testimonyBody = payload.testimonyBody?.trim();
  const author = payload.author?.trim() || "Anonymous";
  const isAnonymous = payload.isAnonymous === true;
  const linkedPrayerBody = payload.linkedPrayerBody?.trim() || null;
  const images = Array.isArray(payload.images) ? payload.images.slice(0, MAX_IMAGES) : [];

  if (!sourceId || !testimonyBody) {
    return NextResponse.json({ error: "Missing sourceId or testimonyBody" }, { status: 400 });
  }

  let client;
  try {
    client = getSanityWriteClient();
  } catch {
    return NextResponse.json({ error: "Submissions are not configured" }, { status: 500 });
  }

  const imageWarnings: string[] = [];
  const assetIds: string[] = [];
  for (const [index, url] of images.entries()) {
    try {
      const imageRes = await fetch(url);
      if (!imageRes.ok) throw new Error(`HTTP ${imageRes.status}`);
      const contentType = imageRes.headers.get("content-type") ?? "";
      if (!contentType.startsWith("image/")) throw new Error("not an image");
      // Reject on the declared size before buffering the body -- avoids
      // downloading an oversized file in full just to discard it below.
      // Not a hard guarantee (a server can lie about Content-Length or omit
      // it), so the post-buffer check stays as the real enforcement.
      const contentLength = imageRes.headers.get("content-length");
      if (contentLength && Number(contentLength) > MAX_IMAGE_BYTES) throw new Error("too large");
      const buffer = Buffer.from(await imageRes.arrayBuffer());
      if (buffer.byteLength > MAX_IMAGE_BYTES) throw new Error("too large");
      const asset = await client.assets.upload("image", buffer, {
        filename: `testimony-${sourceId}-${index}.jpg`,
      });
      assetIds.push(asset._id);
    } catch (err) {
      imageWarnings.push(`Image ${index + 1}: ${err instanceof Error ? err.message : "upload failed"}`);
    }
  }

  const title = titleFromBody(testimonyBody);
  const excerpt = testimonyBody.length > 200 ? `${testimonyBody.slice(0, 197)}…` : testimonyBody;
  const basePostId = `testimony-${sourceId}`;

  const body = [
    ...(linkedPrayerBody
      ? [
          plainTextBlock("Original Prayer Request", "h4"),
          ...textToBlocks(linkedPrayerBody, "blockquote"),
          plainTextBlock("Testimony", "h4"),
        ]
      : []),
    ...textToBlocks(testimonyBody),
  ];

  if (assetIds.length > 1) {
    body.push({
      _type: "gallery",
      _key: key(),
      images: assetIds.slice(1).map((id) => ({
        _type: "image" as const,
        _key: key(),
        asset: { _type: "reference" as const, _ref: id },
      })),
    } as never);
  }

  const doc: Record<string, unknown> = {
    _id: `drafts.${basePostId}`,
    _type: "post",
    title,
    slug: { _type: "slug", current: `${slugify(title) || "testimony"}-${sourceId.slice(0, 8)}` },
    category: "Testimonies",
    excerpt,
    publishedAt: new Date().toISOString(),
    author,
    body,
    isVisitorSubmission: true,
    submissionStoryType: "Testimony",
    submissionSourceId: sourceId,
    // Anonymous testimonies never carry the real name onto this document --
    // only the already-anonymized `author` string is stored here.
    ...(!isAnonymous ? { submitterName: author } : {}),
  };
  if (assetIds[0]) {
    doc.mainImage = { _type: "image", asset: { _type: "reference", _ref: assetIds[0] } };
  }

  try {
    await client.createOrReplace(doc as never);
  } catch {
    return NextResponse.json({ error: "Failed to save submission" }, { status: 502 });
  }

  // Best-effort admin notification -- a failed email shouldn't fail the sync
  // itself, since the draft is already safely saved above.
  try {
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const recipients = getContactRecipients(await getSiteSettings());
    if (gmailUser && gmailAppPassword && recipients.length > 0) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailAppPassword },
      });
      await transporter.sendMail({
        from: `CCSGM Website <${gmailUser}>`,
        to: recipients,
        subject: `[Testimony via CCSGM Connect] ${title}`,
        html: `
          <p>A member shared a testimony in CCSGM Connect and it was approved for the website, saved as a draft article.</p>
          <p><strong>Title:</strong> ${escapeHtml(title)}</p>
          <p><strong>From:</strong> ${escapeHtml(author)}</p>
          <p><strong>Excerpt:</strong></p>
          <p>${escapeHtml(excerpt)}</p>
          <p>Open Studio and check "📬 Story Submissions" to review, edit, and publish or discard it.</p>
        `,
      });
    }
  } catch {
    // Swallow -- submission already saved successfully.
  }

  return NextResponse.json({ ok: true, postId: basePostId, imageWarnings });
}
