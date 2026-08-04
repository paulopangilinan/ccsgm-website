// Shared block-builders for hand-assembling Portable Text bodies outside of
// the rich-text editor -- used by both /api/share-story (converts TipTap
// output) and /api/testimony-sync (converts plain text from ccsgm-connect).

export function key() {
  return Math.random().toString(36).slice(2, 10);
}

export function plainTextBlock(text: string, style: "normal" | "h4" | "blockquote" = "normal") {
  return {
    _type: "block" as const,
    _key: key(),
    style,
    markDefs: [],
    children: [{ _type: "span" as const, _key: key(), text, marks: [] }],
  };
}

/** Splits plain text on blank lines into one block per paragraph. */
export function textToBlocks(text: string, style: "normal" | "blockquote" = "normal") {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (paragraphs.length ? paragraphs : [text]).map((p) => plainTextBlock(p, style));
}

export function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
