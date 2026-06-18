import { createClient } from "@sanity/client";
import { JSDOM } from "jsdom";
import { randomBytes } from "crypto";

const client = createClient({
  projectId: "88pu18r5",
  dataset: "production",
  apiVersion: "2024-01-01",
  token: process.env.SANITY_TEST_TOKEN,
  useCdn: false,
});

const BATCH = [
  "https://ccs-gm.co/for-reasons-known-only-to-himself/",
  "https://ccs-gm.co/when-staying-means-learning/",
  "https://ccs-gm.co/from-through-but-always-for-his-glory-and-our-good/",
  "https://ccs-gm.co/when-parenting-matters-to-god/",
  "https://ccs-gm.co/of-burned-out-fresh-feathers/",
];

function key() {
  return randomBytes(6).toString("hex");
}

function slugFromUrl(url) {
  const parts = new URL(url).pathname.split("/").filter(Boolean);
  return parts[parts.length - 1];
}

// Flattens inline DOM nodes into a sequence of segments: text runs (with marks/link)
// and "br" markers. Used for paragraphs, list items, blockquote text.
function collectInline(node, marks, linkHref, out) {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === 3) {
      // text node
      const text = child.textContent;
      if (text) out.push({ type: "text", text, marks: [...marks], linkHref });
      continue;
    }
    if (child.nodeType !== 1) continue;
    const tag = child.tagName.toLowerCase();
    if (tag === "br") {
      out.push({ type: "br" });
      continue;
    }
    if (tag === "img") continue; // handled separately by caller
    let nextMarks = marks;
    let nextLink = linkHref;
    if (tag === "strong" || tag === "b" || tag === "mark") nextMarks = [...marks, "strong"];
    else if (tag === "em" || tag === "i") nextMarks = [...marks, "em"];
    else if (tag === "u") nextMarks = [...marks, "underline"];
    else if (tag === "s" || tag === "strike" || tag === "del") nextMarks = [...marks, "strike-through"];
    else if (tag === "a") nextLink = child.getAttribute("href") || linkHref;
    collectInline(child, nextMarks, nextLink, out);
  }
}

// Splits a flat segment sequence on "br" markers into groups, then builds
// portable text spans + markDefs for each group.
function segmentsToBlockGroups(segments, baseStyle, listItem) {
  const groups = [[]];
  for (const seg of segments) {
    if (seg.type === "br") groups.push([]);
    else groups[groups.length - 1].push(seg);
  }

  const blocks = [];
  for (const group of groups) {
    const markDefs = [];
    const linkKeyByHref = new Map();
    const children = [];
    for (const seg of group) {
      if (!seg.text) continue;
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

function paragraphToBlocks(el, style = "normal", listItem) {
  const segments = [];
  collectInline(el, [], undefined, segments);
  return segmentsToBlockGroups(segments, style, listItem);
}

function plainText(el) {
  return el.textContent.replace(/\s+/g, " ").trim();
}

async function uploadImage(src) {
  const res = await fetch(src);
  if (!res.ok) throw new Error(`Image fetch failed ${res.status}: ${src}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const filename = src.split("/").pop()?.split("?")[0] || "image.jpg";
  const asset = await client.assets.upload("image", buf, { filename });
  return asset._id;
}

async function getFeaturedImageUrl(slug) {
  try {
    const res = await fetch(
      `https://ccs-gm.co/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const media = data[0]?._embedded?.["wp:featuredmedia"]?.[0];
    return media?.source_url ?? null;
  } catch {
    return null;
  }
}

function sameImage(srcA, srcB) {
  if (!srcA || !srcB) return false;
  const base = (s) => s.split("/").pop()?.split("?")[0];
  return base(srcA) === base(srcB);
}

async function migrateOne(url) {
  const html = await fetch(url).then((r) => r.text());
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const slug = slugFromUrl(url);

  const title = plainText(doc.querySelector("h1.entry-title"));
  const timeEl = doc.querySelector("time.entry-date.published");
  const publishedAt = timeEl ? timeEl.getAttribute("datetime") : new Date().toISOString();
  const wpAuthor = doc.querySelector(".entry-meta .author .fn a")?.textContent.trim();

  const content = doc.querySelector(".entry-content");
  // Drop the trailing duplicate-title artifact WP themes append.
  content.querySelector(".extra-hatom-entry-title")?.remove();

  const blocks = [];
  let mainImageAssetId;
  let mainImageSrc = await getFeaturedImageUrl(slug);
  if (mainImageSrc) mainImageAssetId = await uploadImage(mainImageSrc);
  let bodyTextForExcerpt = "";
  let detectedAuthor;

  for (const el of Array.from(content.children)) {
    const tag = el.tagName.toLowerCase();

    if (tag === "figure" || tag === "p" && el.querySelector("img")) {
      const img = el.querySelector("img");
      if (img?.src) {
        if (!mainImageSrc) {
          // No WP featured image found — fall back to the first inline image.
          mainImageSrc = img.src;
          mainImageAssetId = await uploadImage(img.src);
          continue;
        }
        if (sameImage(img.src, mainImageSrc)) continue; // already shown as hero image
        const assetId = await uploadImage(img.src);
        blocks.push({ _type: "image", _key: key(), asset: { _type: "reference", _ref: assetId } });
        continue;
      }
    }

    if (tag === "p") {
      const text = plainText(el);
      if (!text) continue;
      const newBlocks = paragraphToBlocks(el);
      // Detect author/skip excerpt candidacy per rendered line (post-<br>-split),
      // not the whole paragraph — a greedy match across a run-on <br> line would
      // otherwise swallow unrelated trailing text (e.g. "by Jeff Jo<br>Passage: ...").
      const META_LINE = /^(reflection\b|reading:|passage to reflect|scripture|text:|by[:\s])/i;
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
      for (const innerEl of inner) {
        blocks.push(...paragraphToBlocks(innerEl, "blockquote"));
      }
      continue;
    }

    // Fallback: any other tag with text, treat as a normal paragraph.
    const text = plainText(el);
    if (text) blocks.push(...paragraphToBlocks(el));
  }

  const excerpt = bodyTextForExcerpt.length > 200 ? bodyTextForExcerpt.slice(0, 197) + "…" : bodyTextForExcerpt;

  const doc_ = {
    _id: `drafts.migrated-${slugFromUrl(url)}`,
    _type: "post",
    title,
    slug: { _type: "slug", current: slugFromUrl(url) },
    category: "Blogs",
    blogSubCategory: "Pastor's Devotion",
    excerpt,
    publishedAt,
    author: detectedAuthor || wpAuthor || "",
    ...(mainImageAssetId
      ? { mainImage: { _type: "image", asset: { _type: "reference", _ref: mainImageAssetId } } }
      : {}),
    body: blocks,
  };

  await client.createOrReplace(doc_);
  return { title, id: doc_._id, blocks: blocks.length, hasImage: !!mainImageAssetId };
}

async function main() {
  for (const url of BATCH) {
    try {
      const result = await migrateOne(url);
      console.log("OK:", JSON.stringify(result));
    } catch (e) {
      console.log("FAILED:", url, e.message);
    }
  }
}

main();
