import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getSanityWriteClient } from "@/lib/sanityWriteClient";
import { getSiteSettings, getContactRecipients } from "@/lib/siteSettings";
import { verifyTurnstile } from "@/lib/turnstile";
import { escapeHtml } from "@/lib/escapeHtml";
import { getYouTubeId } from "@/lib/youtubeId";
import { proseMirrorToPortableText } from "@/lib/proseMirrorToPortableText";

export const maxDuration = 30;

const STORY_TYPES = [
  "Testimony",
  "Devotion",
  "Praise Report",
  "Prayer Request",
  "Salvation Story",
  "Missions Update",
  "Other",
] as const;

// Best-effort mapping onto the site's existing article taxonomy so a
// submission lands somewhere sensible by default — admins can always
// recategorise while reviewing the draft.
const CATEGORY_BY_STORY_TYPE: Record<string, string> = {
  Testimony: "Testimonies",
  "Salvation Story": "Testimonies",
  "Praise Report": "Testimonies",
  Devotion: "Blogs",
  "Missions Update": "Missions",
  "Prayer Request": "Testimonies",
  Other: "Blogs",
};

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8MB

function key() {
  return Math.random().toString(36).slice(2, 10);
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function plainTextBlock(text: string) {
  return {
    _type: "block" as const,
    _key: key(),
    style: "normal",
    markDefs: [],
    children: [{ _type: "span" as const, _key: key(), text, marks: [] }],
  };
}

function videoBlock(url: string) {
  const youtubeId = getYouTubeId(url);
  if (youtubeId) {
    return { _type: "youtube", _key: key(), url };
  }
  const linkKey = key();
  return {
    _type: "block" as const,
    _key: key(),
    style: "normal",
    markDefs: [{ _type: "link" as const, _key: linkKey, href: url }],
    children: [{ _type: "span" as const, _key: key(), text: "Watch the video", marks: [linkKey] }],
  };
}

export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const name = (form.get("name") as string | null)?.trim() || "";
  const email = (form.get("email") as string | null)?.trim() || "";
  const storyType = (form.get("storyType") as string | null)?.trim() || "";
  const title = (form.get("title") as string | null)?.trim() || "";
  const storyText = (form.get("storyText") as string | null)?.trim() || "";
  const storyDocRaw = (form.get("storyDoc") as string | null) || "";
  const videoUrl = (form.get("videoUrl") as string | null)?.trim() || "";
  const turnstileToken = (form.get("turnstileToken") as string | null) || undefined;
  const image = form.get("image");

  if (!storyType || !STORY_TYPES.includes(storyType as (typeof STORY_TYPES)[number])) {
    return NextResponse.json({ error: "Invalid story type" }, { status: 400 });
  }
  if (!title || !storyText) {
    return NextResponse.json({ error: "Title and story are required" }, { status: 400 });
  }

  let storyBlocks: unknown[] = [];
  try {
    const parsedDoc = JSON.parse(storyDocRaw);
    storyBlocks = proseMirrorToPortableText(parsedDoc);
  } catch {
    storyBlocks = [];
  }
  if (storyBlocks.length === 0) storyBlocks = [plainTextBlock(storyText)];
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return NextResponse.json({ error: "Bot verification failed" }, { status: 403 });
  }

  let client;
  try {
    client = getSanityWriteClient();
  } catch {
    return NextResponse.json({ error: "Submissions are not configured" }, { status: 500 });
  }

  let mainImageAssetId: string | undefined;
  if (image instanceof File && image.size > 0) {
    if (!image.type.startsWith("image/")) {
      return NextResponse.json({ error: "Photo must be an image file" }, { status: 400 });
    }
    if (image.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "Photo is too large (max 8MB)" }, { status: 400 });
    }
    try {
      const buffer = Buffer.from(await image.arrayBuffer());
      const asset = await client.assets.upload("image", buffer, { filename: image.name });
      mainImageAssetId = asset._id;
    } catch {
      return NextResponse.json({ error: "Failed to upload photo" }, { status: 502 });
    }
  }

  const body = [...storyBlocks, ...(videoUrl ? [videoBlock(videoUrl)] : [])];
  const excerpt = storyText.length > 200 ? `${storyText.slice(0, 197)}…` : storyText;
  const slug = `${slugify(title) || "story"}-${key()}`;

  const doc: Record<string, unknown> = {
    _id: `drafts.story-${slug}`,
    _type: "post",
    title,
    slug: { _type: "slug", current: slug },
    category: CATEGORY_BY_STORY_TYPE[storyType] ?? "Blogs",
    excerpt,
    publishedAt: new Date().toISOString(),
    author: name || "Anonymous",
    body,
    isVisitorSubmission: true,
    submissionStoryType: storyType,
    ...(name ? { submitterName: name } : {}),
    ...(email ? { submitterEmail: email } : {}),
    ...(videoUrl ? { submittedVideoUrl: videoUrl } : {}),
  };
  if (mainImageAssetId) {
    doc.mainImage = { _type: "image", asset: { _type: "reference", _ref: mainImageAssetId } };
  }

  try {
    await client.create(doc as never);
  } catch {
    return NextResponse.json({ error: "Failed to save submission" }, { status: 502 });
  }

  // Best-effort admin notification — a failed email shouldn't fail the
  // submission itself, since the draft is already safely saved above.
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
        replyTo: email || undefined,
        subject: `[Story Submission] ${storyType} — ${title}`,
        html: `
          <p>A new story was submitted on the website, saved as a draft article.</p>
          <p><strong>Type:</strong> ${escapeHtml(storyType)}</p>
          <p><strong>Title:</strong> ${escapeHtml(title)}</p>
          <p><strong>From:</strong> ${escapeHtml(name || "Anonymous")} ${email ? `(${escapeHtml(email)})` : ""}</p>
          <p><strong>Excerpt:</strong></p>
          <p>${escapeHtml(excerpt)}</p>
          <p>Open Studio and check "📬 Story Submissions" to review, edit, and publish or discard it.</p>
        `,
      });
    }
  } catch {
    // Swallow — submission already saved successfully.
  }

  return NextResponse.json({ ok: true });
}
