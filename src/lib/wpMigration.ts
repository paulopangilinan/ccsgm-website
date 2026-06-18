import { JSDOM } from "jsdom";
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
type BodyBlock = Block | ImageBlock;

type Segment = { type: "text"; text: string; marks: string[]; linkHref?: string } | { type: "br" };

function collectInline(node: Node, marks: string[], linkHref: string | undefined, out: Segment[]) {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === 3) {
      const text = child.textContent;
      if (text) out.push({ type: "text", text, marks: [...marks], linkHref });
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

const META_LINE = /^(reflection\b|reading:|passage to reflect|scripture|text:|by[:\s])/i;

export type WpListItem = {
  wpId: number;
  title: string;
  link: string;
  date: string;
  excerpt: string;
};

// Source sites this tool is allowed to fetch from. These routes accept a
// caller-supplied URL and fetch it server-side — without an allowlist, the
// endpoint would act as an open proxy/SSRF primitive for any host.
const ALLOWED_MIGRATION_HOSTS = ["ccs-gm.co", "www.ccs-gm.co"];

function assertAllowedHost(hostname: string) {
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

export async function listPostsInCategory(siteUrl: string, categoryId: number): Promise<WpListItem[]> {
  const items: WpListItem[] = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `${siteUrl}/wp-json/wp/v2/posts?categories=${categoryId}&per_page=100&page=${page}&_fields=id,title,link,date,excerpt`
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

export type MigrateTarget = {
  category: string;
  subCategoryField?: "subCategory" | "programSubCategory" | "blogSubCategory";
  subCategoryValue?: string;
};

export async function migrateWpPost(
  siteUrl: string,
  wpPostId: number,
  target: MigrateTarget
): Promise<{ sanityId: string; title: string }> {
  assertAllowedHost(new URL(siteUrl).hostname);

  const token = process.env.SANITY_API_WRITE_TOKEN;
  if (!token) throw new Error("SANITY_API_WRITE_TOKEN is not configured");

  const client = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
    apiVersion: "2024-01-01",
    token,
    useCdn: false,
  });

  const res = await fetch(`${siteUrl}/wp-json/wp/v2/posts/${wpPostId}?_embed`);
  if (!res.ok) throw new Error(`Could not fetch WordPress post ${wpPostId}`);
  const post = await res.json();

  const title = stripTags(post.title?.rendered ?? "Untitled");
  const publishedAt = post.date_gmt ? `${post.date_gmt}Z` : new Date().toISOString();
  const wpAuthorName: string | undefined = post._embedded?.author?.[0]?.name;
  const slug: string = post.slug || `wp-${wpPostId}`;

  const dom = new JSDOM(`<div id="root">${post.content?.rendered ?? ""}</div>`);
  const content = dom.window.document.getElementById("root")!;
  content.querySelector(".extra-hatom-entry-title")?.remove();

  let mainImageSrc: string | null = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url ?? null;
  let mainImageAssetId: string | undefined;
  if (mainImageSrc) mainImageAssetId = await uploadImageFromUrl(client, mainImageSrc);

  const blocks: BodyBlock[] = [];
  let bodyTextForExcerpt = "";
  let detectedAuthor: string | undefined;

  for (const el of Array.from(content.children)) {
    const tag = el.tagName.toLowerCase();

    if (tag === "figure" || (tag === "p" && el.querySelector("img"))) {
      const img = el.querySelector("img");
      if (img?.src) {
        if (!mainImageSrc) {
          mainImageSrc = img.src;
          mainImageAssetId = await uploadImageFromUrl(client, img.src);
          continue;
        }
        if (sameImage(img.src, mainImageSrc)) continue;
        const assetId = await uploadImageFromUrl(client, img.src);
        blocks.push({ _type: "image", _key: key(), asset: { _type: "reference", _ref: assetId } });
        continue;
      }
    }

    if (tag === "p") {
      const text = plainText(el);
      if (!text) continue;
      const newBlocks = paragraphToBlocks(el);
      for (const b of newBlocks) {
        const lineText = b.children.map((c) => c.text).join("").trim();
        if (!detectedAuthor) {
          const m = lineText.match(/^by[:\s]+(.+)$/i);
          if (m && m[1].length <= 60) detectedAuthor = m[1].trim();
        }
        if (!bodyTextForExcerpt && lineText.length > 60 && !META_LINE.test(lineText)) {
          bodyTextForExcerpt = lineText;
        }
      }
      blocks.push(...newBlocks);
      continue;
    }

    if (tag === "ul" || tag === "ol") {
      const listItem = tag === "ul" ? "bullet" : "number";
      for (const li of Array.from(el.children)) {
        if (li.tagName.toLowerCase() !== "li") continue;
        blocks.push(...paragraphToBlocks(li, "normal", listItem));
      }
      continue;
    }

    if (/^h[1-6]$/.test(tag)) {
      const level = Math.min(4, parseInt(tag[1], 10));
      blocks.push(...paragraphToBlocks(el, `h${level}`));
      continue;
    }

    if (tag === "blockquote") {
      const inner = el.querySelectorAll("p").length ? Array.from(el.querySelectorAll("p")) : [el];
      for (const innerEl of inner) blocks.push(...paragraphToBlocks(innerEl, "blockquote"));
      continue;
    }

    const text = plainText(el);
    if (text) blocks.push(...paragraphToBlocks(el));
  }

  const excerpt = bodyTextForExcerpt.length > 200 ? bodyTextForExcerpt.slice(0, 197) + "…" : bodyTextForExcerpt;

  const doc: Record<string, unknown> = {
    _id: `drafts.migrated-${slug}`,
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
  if (target.subCategoryField && target.subCategoryValue) {
    doc[target.subCategoryField] = target.subCategoryValue;
  }

  await client.createOrReplace(doc as never);
  return { sanityId: doc._id as string, title };
}
