import { parseHTML } from "linkedom";
import { randomBytes } from "crypto";
import { createClient } from "@sanity/client";

function key() {
  return randomBytes(6).toString("hex");
}

function sameImage(srcA?: string | null, srcB?: string | null) {
  if (!srcA || !srcB) return false;
  const base = (s: string) => s.split("/").pop()?.split("?")[0];
  return base(srcA) === base(srcB);
}

type Span = { _type: "span"; _key: string; text: string; marks: string[] };
type Block = {
  _type: "block";
  _key: string;
  style: string;
  markDefs: { _type: "link"; _key: string; href: string }[];
  children: Span[];
  listItem?: "bullet" | "number";
  level?: number;
};
type ImageBlock = { _type: "image"; _key: string; asset: { _type: "reference"; _ref: string } };
type GalleryBlock = { _type: "gallery"; _key: string; images: ImageBlock[] };
type YouTubeBlock = { _type: "youtube"; _key: string; url: string };
type VideoFileBlock = { _type: "videoFile"; _key: string; url: string };
type BodyBlock = Block | ImageBlock | GalleryBlock | YouTubeBlock | VideoFileBlock;

type Segment = { type: "text"; text: string; marks: string[]; linkHref?: string } | { type: "br" };

function collectInline(node: Node, marks: string[], linkHref: string | undefined, out: Segment[]) {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === 3) {
      const raw = child.textContent ?? "";
      if (raw.trim() === "") {
        // Pure formatting whitespace between sibling tags, not real content.
        // A newline among it means these siblings were meant to be on
        // separate lines — this shows up when WP content has no <p>/<br>
        // structure at all, just bare text nodes separated by raw newlines.
        // Treat that as a paragraph break. Without a newline it's just
        // inter-tag indentation with no meaning, so drop it rather than
        // keep it as a literal span (which renders as a stray collapsed
        // space — exactly the "wall of spaces" bug this fixes).
        if (raw.includes("\n")) out.push({ type: "br" });
        continue;
      }
      out.push({ type: "text", text: raw, marks: [...marks], linkHref });
      continue;
    }
    if (child.nodeType !== 1) continue;
    const el = child as Element;
    const tag = el.tagName.toLowerCase();
    if (tag === "br") {
      out.push({ type: "br" });
      continue;
    }
    if (tag === "img") continue;
    let nextMarks = marks;
    let nextLink = linkHref;
    if (tag === "strong" || tag === "b" || tag === "mark") nextMarks = [...marks, "strong"];
    else if (tag === "em" || tag === "i") nextMarks = [...marks, "em"];
    else if (tag === "u") nextMarks = [...marks, "underline"];
    else if (tag === "s" || tag === "strike" || tag === "del") nextMarks = [...marks, "strike-through"];
    else if (tag === "a") nextLink = el.getAttribute("href") || linkHref;
    collectInline(el, nextMarks, nextLink, out);
  }
}

function segmentsToBlockGroups(
  segments: Segment[],
  baseStyle: string,
  listItem?: "bullet" | "number"
): Block[] {
  const groups: Segment[][] = [[]];
  for (const seg of segments) {
    if (seg.type === "br") groups.push([]);
    else groups[groups.length - 1].push(seg);
  }

  const blocks: Block[] = [];
  for (const group of groups) {
    const markDefs: Block["markDefs"] = [];
    const linkKeyByHref = new Map<string, string>();
    const children: Span[] = [];
    for (const seg of group) {
      if (seg.type !== "text" || !seg.text) continue;
      const marks = [...seg.marks];
      if (seg.linkHref) {
        let k = linkKeyByHref.get(seg.linkHref);
        if (!k) {
          k = key();
          linkKeyByHref.set(seg.linkHref, k);
          markDefs.push({ _type: "link", _key: k, href: seg.linkHref });
        }
        marks.push(k);
      }
      children.push({ _type: "span", _key: key(), text: seg.text, marks });
    }
    const text = children.map((c) => c.text).join("").trim();
    if (!text) continue;
    blocks.push({
      _type: "block",
      _key: key(),
      style: baseStyle,
      markDefs,
      children,
      ...(listItem ? { listItem, level: 1 } : {}),
    });
  }
  return blocks;
}

function paragraphToBlocks(el: Element, style = "normal", listItem?: "bullet" | "number") {
  const segments: Segment[] = [];
  collectInline(el, [], undefined, segments);
  return segmentsToBlockGroups(segments, style, listItem);
}

function plainText(el: Element | null) {
  return (el?.textContent ?? "").replace(/\s+/g, " ").trim();
}

const YOUTUBE_URL_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

/**
 * Finds a YouTube video ID inside an element, however the source embedded
 * it: a classic <iframe src="...embed/ID">, a hyperlinked youtu.be/full
 * link, or WordPress's block-embed pattern where the un-rendered REST API
 * content is just the bare URL as text (no <a>, no <iframe>).
 */
function extractYouTubeId(el: Element): string | null {
  const iframeSrc = el.querySelector("iframe")?.getAttribute("src");
  if (iframeSrc) {
    const m = iframeSrc.match(YOUTUBE_URL_RE);
    if (m) return m[1];
  }
  const href = el.querySelector("a")?.getAttribute("href");
  if (href) {
    const m = href.match(YOUTUBE_URL_RE);
    if (m) return m[1];
  }
  const m = plainText(el).match(YOUTUBE_URL_RE);
  return m ? m[1] : null;
}

const META_LINE = /^(reflection\b|reading:|passage to reflect|scripture|text:|by[:\s])/i;

export type WpListItem = {
  wpId: number;
  title: string;
  link: string;
  date: string;
  excerpt: string;
  slug: string;
  alreadyMigrated?: boolean;
};

// Source sites this tool is allowed to fetch from. These routes accept a
// caller-supplied URL and fetch it server-side — without an allowlist, the
// endpoint would act as an open proxy/SSRF primitive for any host.
const ALLOWED_MIGRATION_HOSTS = ["ccs-gm.co", "www.ccs-gm.co"];

export function assertAllowedHost(hostname: string) {
  if (!ALLOWED_MIGRATION_HOSTS.includes(hostname)) {
    throw new Error(`"${hostname}" is not an allowed migration source. Allowed: ${ALLOWED_MIGRATION_HOSTS.join(", ")}`);
  }
}

export async function resolveCategoryFromUrl(categoryUrl: string): Promise<{
  siteUrl: string;
  categoryId: number;
  categoryName: string;
}> {
  const url = new URL(categoryUrl);
  assertAllowedHost(url.hostname);
  const siteUrl = `${url.protocol}//${url.host}`;
  const parts = url.pathname.split("/").filter(Boolean);
  const slug = parts[parts.length - 1];

  const res = await fetch(`${siteUrl}/wp-json/wp/v2/categories?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error(`Could not reach WordPress REST API at ${siteUrl}`);
  const cats = await res.json();
  if (!Array.isArray(cats) || cats.length === 0) {
    throw new Error(`No category found with slug "${slug}" on ${siteUrl}`);
  }
  return { siteUrl, categoryId: cats[0].id, categoryName: cats[0].name };
}

// A WP permalink for a single post (e.g. https://ccs-gm.co/happy-lambs-are-healthy-lambs/)
// has no "/category/" segment — that's what tells it apart from a category
// archive URL pasted into the same box.
export function isSinglePostUrl(rawUrl: string): boolean {
  const parts = new URL(rawUrl).pathname.split("/").filter(Boolean);
  return parts.length > 0 && parts[0] !== "category";
}

export async function resolvePostFromUrl(postUrl: string): Promise<{
  siteUrl: string;
  post: WpListItem;
}> {
  const url = new URL(postUrl);
  assertAllowedHost(url.hostname);
  const siteUrl = `${url.protocol}//${url.host}`;
  const parts = url.pathname.split("/").filter(Boolean);
  const slug = parts[parts.length - 1];

  const res = await fetch(
    `${siteUrl}/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_fields=id,title,link,date,excerpt,slug`
  );
  if (!res.ok) throw new Error(`Could not reach WordPress REST API at ${siteUrl}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error(`No article found with slug "${slug}" on ${siteUrl}`);
  }
  const p = data[0];
  return {
    siteUrl,
    post: {
      wpId: p.id,
      title: stripTags(p.title?.rendered ?? ""),
      link: p.link,
      date: p.date,
      excerpt: stripTags(p.excerpt?.rendered ?? "").slice(0, 160),
      slug: p.slug,
    },
  };
}

function getSanityClient(token: string) {
  return createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2024-01-01",
    token,
    useCdn: false,
  });
}

export async function markAlreadyMigrated(items: WpListItem[]): Promise<WpListItem[]> {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token || items.length === 0) return items;

  const client = getSanityClient(token);
  const slugs = items.map((i) => i.slug);
  const existing: string[] = await client.fetch(
    `*[_type == "post" && slug.current in $slugs].slug.current`,
    { slugs },
    { perspective: "raw" }
  );
  const existingSet = new Set(existing);
  return items.map((i) => ({ ...i, alreadyMigrated: existingSet.has(i.slug) }));
}

export async function listPostsInCategory(siteUrl: string, categoryId: number): Promise<WpListItem[]> {
  const items: WpListItem[] = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `${siteUrl}/wp-json/wp/v2/posts?categories=${categoryId}&per_page=100&page=${page}&_fields=id,title,link,date,excerpt,slug`
    );
    if (!res.ok) break;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) break;
    for (const p of data) {
      items.push({
        wpId: p.id,
        title: stripTags(p.title?.rendered ?? ""),
        link: p.link,
        date: p.date,
        excerpt: stripTags(p.excerpt?.rendered ?? "").slice(0, 160),
        slug: p.slug,
      });
    }
    const totalPages = Number(res.headers.get("X-WP-TotalPages") ?? "1");
    if (page >= totalPages) break;
    page++;
  }
  return items;
}

function decodeEntities(str: string): string {
  return str
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&#8220;/g, "“")
    .replace(/&#8221;/g, "”")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8230;/g, "…")
    .replace(/&nbsp;/g, " ");
}

function stripTags(html: string) {
  return decodeEntities(html.replace(/<[^>]+>/g, "").trim());
}

async function uploadImageFromUrl(
  client: ReturnType<typeof createClient>,
  src: string
): Promise<string> {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Image fetch failed ${res.status}: ${src}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const filename = src.split("/").pop()?.split("?")[0] || "image.jpg";
  const asset = await client.assets.upload("image", buf, { filename });
  return asset._id;
}

// Posts with many/large photos (phone-camera resolution galleries are common
// in these WP posts) take too long to upload one at a time and can exceed the
// host's serverless function timeout. Uploading with bounded concurrency cuts
// wall-clock time roughly proportional to the concurrency limit.
async function uploadImagesConcurrently(
  client: ReturnType<typeof createClient>,
  srcs: string[],
  concurrency = 4
): Promise<Map<string, string>> {
  const unique = Array.from(new Set(srcs));
  const result = new Map<string, string>();
  let i = 0;
  async function worker() {
    while (i < unique.length) {
      const idx = i++;
      const src = unique[idx];
      try {
        result.set(src, await uploadImageFromUrl(client, src));
      } catch {
        // Leave unresolved — caller treats a missing map entry as "skip this image".
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, unique.length) }, worker));
  return result;
}

export type MigrateTarget = {
  category: string;
  referenceField?: "subCategory" | "programSubCategory" | "projectSubCategory" | "blogSubCategory";
  referenceId?: string;
  publish?: boolean;
};

async function fetchWpPost(siteUrl: string, wpPostId: number) {
  assertAllowedHost(new URL(siteUrl).hostname);
  const res = await fetch(`${siteUrl}/wp-json/wp/v2/posts/${wpPostId}?_embed`);
  if (!res.ok) throw new Error(`Could not fetch WordPress post ${wpPostId}`);
  return res.json();
}

function extractImageSrcs(post: Record<string, unknown>): { mainImageSrc: string | null; contentImageSrcs: string[] } {
  const embedded = post._embedded as Record<string, unknown> | undefined;
  const featuredMedia = embedded?.["wp:featuredmedia"] as Array<{ source_url?: string }> | undefined;
  const mainImageSrc: string | null = featuredMedia?.[0]?.source_url ?? null;

  const content = post.content as { rendered?: string } | undefined;
  const { document } = parseHTML(`<div id="root">${content?.rendered ?? ""}</div>`);
  const root = document.getElementById("root")!;
  const contentImageSrcs = Array.from(root.querySelectorAll("img"))
    .map((img) => img.src)
    .filter((src): src is string => Boolean(src));

  return { mainImageSrc, contentImageSrcs };
}

/**
 * Lists every image URL a post needs (featured + inline), without uploading
 * anything. The Studio tool calls this first, then uploads each image via
 * its own short-lived request — Netlify's serverless functions hard-cap at
 * 10–26s with no override, so a post with many large photos can't safely
 * upload them all inside one request.
 */
export async function getWpPostImageSrcs(siteUrl: string, wpPostId: number): Promise<string[]> {
  const post = await fetchWpPost(siteUrl, wpPostId);
  const { mainImageSrc, contentImageSrcs } = extractImageSrcs(post);
  return Array.from(new Set(mainImageSrc ? [mainImageSrc, ...contentImageSrcs] : contentImageSrcs));
}

export async function uploadSingleImage(src: string): Promise<string> {
  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) throw new Error("SANITY_API_WRITE_TOKEN is not configured");
  return uploadImageFromUrl(getSanityClient(token), src);
}

export async function migrateWpPost(
  siteUrl: string,
  wpPostId: number,
  target: MigrateTarget,
  preUploadedImages?: Record<string, string>
): Promise<{ sanityId: string; title: string }> {
  assertAllowedHost(new URL(siteUrl).hostname);

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) throw new Error("SANITY_API_WRITE_TOKEN is not configured");

  const client = getSanityClient(token);

  const post = await fetchWpPost(siteUrl, wpPostId);

  const title = stripTags(post.title?.rendered ?? "Untitled");
  const publishedAt = post.date_gmt ? `${post.date_gmt}Z` : new Date().toISOString();
  const wpAuthorName: string | undefined = post._embedded?.author?.[0]?.name;
  const slug: string = post.slug || `wp-${wpPostId}`;

  const { document } = parseHTML(`<div id="root">${post.content?.rendered ?? ""}</div>`);
  const content = document.getElementById("root")!;
  content.querySelector(".extra-hatom-entry-title")?.remove();

  const { mainImageSrc: initialMainImageSrc, contentImageSrcs } = extractImageSrcs(post);
  let mainImageSrc = initialMainImageSrc;

  const assetIdBySrc = new Map<string, string>(Object.entries(preUploadedImages ?? {}));
  if (!preUploadedImages) {
    const allImageSrcs = mainImageSrc ? [mainImageSrc, ...contentImageSrcs] : contentImageSrcs;
    const uploaded = await uploadImagesConcurrently(client, allImageSrcs);
    for (const [src, assetId] of uploaded) assetIdBySrc.set(src, assetId);
  }

  let mainImageAssetId: string | undefined = mainImageSrc ? assetIdBySrc.get(mainImageSrc) : undefined;
  if (mainImageSrc && !mainImageAssetId) mainImageSrc = null; // upload failed — drop the hero image, don't fail the whole post

  const blocks: BodyBlock[] = [];
  let bodyTextForExcerpt = "";
  let detectedAuthor: string | undefined;

  // Shared by every code path that turns an element into blocks (<p>, and
  // the generic div/other fallback below) — content without proper <p>
  // wrapping was previously skipping this entirely, leaving the excerpt
  // empty even though the post clearly had a body.
  function detectAuthorAndExcerpt(newBlocks: Block[]) {
    for (const b of newBlocks) {
      const lineText = b.children.map((c) => c.text).join("").trim();
      if (!detectedAuthor) {
        // "By: NAME" (colon) is an unambiguous byline. A bare "by " needs a
        // capitalized word immediately after (a name, not a sentence like
        // "By doing so, ...") and no comma — names don't have commas, but
        // plenty of ordinary sentences that happen to start with "by" do.
        const m =
          lineText.match(/^by:\s*([^,]{2,40})$/i) ||
          lineText.match(/^by\s+([A-Z][^,]{1,28})$/);
        if (m && m[1].trim().split(/\s+/).length <= 6) detectedAuthor = m[1].trim();
      }
      if (!bodyTextForExcerpt && lineText.length > 60 && !META_LINE.test(lineText)) {
        bodyTextForExcerpt = lineText;
      }
    }
  }

  // Six or more images in a row with no text between them read better as one
  // gallery than as a wall of full-width images — these buffer until the run
  // breaks (any non-image-only element), then flush as a gallery (>=6) or as
  // plain inline images (<6, preserving the old per-image behaviour).
  const GALLERY_THRESHOLD = 6;
  let pendingGalleryImages: ImageBlock[] = [];
  function flushGallery() {
    if (pendingGalleryImages.length === 0) return;
    if (pendingGalleryImages.length >= GALLERY_THRESHOLD) {
      blocks.push({ _type: "gallery", _key: key(), images: pendingGalleryImages });
    } else {
      blocks.push(...pendingGalleryImages);
    }
    pendingGalleryImages = [];
  }

  for (const el of Array.from(content.children)) {
    const tag = el.tagName.toLowerCase();

    if (tag === "figure" || tag === "p" || tag === "div") {
      const youTubeId = extractYouTubeId(el);
      // An <iframe> embed has no text content of its own, so any text found
      // alongside it is genuinely separate surrounding prose. A bare-URL
      // embed's only "text" IS the URL — comparing against the URL itself
      // (not just non-empty) tells those two cases apart.
      const hasIframe = !!el.querySelector("iframe");
      const textBesidesUrl = plainText(el).replace(YOUTUBE_URL_RE, "").trim();
      if (youTubeId && (hasIframe || !textBesidesUrl)) {
        flushGallery();
        blocks.push({ _type: "youtube", _key: key(), url: `https://www.youtube.com/watch?v=${youTubeId}` });
        continue;
      }
    }

    if (tag === "figure" || tag === "p" || tag === "div") {
      // Self-hosted video files (WordPress's "Video" block: <video src="...">,
      // sometimes with the source on a nested <source> instead) — not YouTube,
      // so kept as a direct link/embed rather than uploaded as a Sanity asset
      // (these can be hundreds of MB, same reasoning as the PDF block).
      const videoEl = el.querySelector("video");
      const videoSrc = videoEl?.getAttribute("src") || videoEl?.querySelector("source")?.getAttribute("src");
      if (videoSrc) {
        flushGallery();
        blocks.push({ _type: "videoFile", _key: key(), url: videoSrc });
        continue;
      }
    }

    const isImageOnly = (tag === "figure" || tag === "p") && el.querySelector("img") && !plainText(el);

    if (tag === "figure" || (tag === "p" && el.querySelector("img"))) {
      // A <p> can contain an image AND its own surrounding text (some WP posts
      // cram everything into one paragraph) — extract/upload the image(s) but
      // don't skip the rest of the element; let it fall through to the normal
      // paragraph handling below so the text isn't discarded. A mixed
      // image+text paragraph also breaks any in-progress gallery run.
      if (!isImageOnly) flushGallery();
      for (const img of Array.from(el.querySelectorAll("img"))) {
        if (!img.src) continue;
        const assetId = assetIdBySrc.get(img.src);
        if (!assetId) continue; // upload failed for this one — skip rather than fail the whole post
        if (!mainImageSrc) {
          mainImageSrc = img.src;
          mainImageAssetId = assetId;
          continue;
        }
        if (sameImage(img.src, mainImageSrc)) continue;
        const imageBlock: ImageBlock = { _type: "image", _key: key(), asset: { _type: "reference", _ref: assetId } };
        if (isImageOnly) pendingGalleryImages.push(imageBlock);
        else blocks.push(imageBlock);
      }
      if (tag === "figure") continue;
    }

    if (tag === "p") {
      const text = plainText(el);
      if (!text) continue;
      flushGallery();
      const newBlocks = paragraphToBlocks(el);
      detectAuthorAndExcerpt(newBlocks);
      blocks.push(...newBlocks);
      continue;
    }

    if (tag === "ul" || tag === "ol") {
      flushGallery();
      const listItem = tag === "ul" ? "bullet" : "number";
      for (const li of Array.from(el.children)) {
        if (li.tagName.toLowerCase() !== "li") continue;
        blocks.push(...paragraphToBlocks(li, "normal", listItem));
      }
      continue;
    }

    if (/^h[1-6]$/.test(tag)) {
      flushGallery();
      const level = Math.min(4, parseInt(tag[1], 10));
      blocks.push(...paragraphToBlocks(el, `h${level}`));
      continue;
    }

    if (tag === "blockquote") {
      flushGallery();
      const inner = el.querySelectorAll("p").length ? Array.from(el.querySelectorAll("p")) : [el];
      for (const innerEl of inner) blocks.push(...paragraphToBlocks(innerEl, "blockquote"));
      continue;
    }

    const text = plainText(el);
    if (text) {
      flushGallery();
      const newBlocks = paragraphToBlocks(el);
      detectAuthorAndExcerpt(newBlocks);
      blocks.push(...newBlocks);
    }
  }
  flushGallery();

  const excerpt = bodyTextForExcerpt.length > 200 ? bodyTextForExcerpt.slice(0, 197) + "…" : bodyTextForExcerpt;

  const docId = target.publish ? `migrated-${slug}` : `drafts.migrated-${slug}`;
  const doc: Record<string, unknown> = {
    _id: docId,
    _type: "post",
    title,
    slug: { _type: "slug", current: slug },
    category: target.category,
    excerpt,
    publishedAt,
    author: detectedAuthor || wpAuthorName || "",
    body: blocks,
  };
  if (mainImageAssetId) {
    doc.mainImage = { _type: "image", asset: { _type: "reference", _ref: mainImageAssetId } };
  }
  if (target.referenceField && target.referenceId) {
    doc[target.referenceField] = { _type: "reference", _ref: target.referenceId };
  }

  await client.createOrReplace(doc as never);
  return { sanityId: doc._id as string, title };
}
