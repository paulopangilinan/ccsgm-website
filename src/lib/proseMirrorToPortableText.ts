// Converts a TipTap/ProseMirror JSON document into Sanity's portable text
// block array. Covers exactly what the Share Your Story editor's toolbar
// exposes (paragraphs, headings, bold/italic, links, lists, blockquote) —
// not a general-purpose converter.

type PMMark = { type: string; attrs?: Record<string, unknown> };
type PMNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: PMNode[];
  text?: string;
  marks?: PMMark[];
};

function key() {
  return Math.random().toString(36).slice(2, 10);
}

const MARK_MAP: Record<string, string> = {
  bold: "strong",
  italic: "em",
};

function spansFromInline(nodes: PMNode[] | undefined, markDefs: { _type: "link"; _key: string; href: string }[]) {
  if (!nodes) return [];
  return nodes
    .filter((n) => n.type === "text" && n.text)
    .map((n) => {
      const marks: string[] = [];
      for (const mark of n.marks ?? []) {
        if (mark.type === "link" && typeof mark.attrs?.href === "string") {
          const markKey = key();
          markDefs.push({ _type: "link", _key: markKey, href: mark.attrs.href });
          marks.push(markKey);
        } else if (MARK_MAP[mark.type]) {
          marks.push(MARK_MAP[mark.type]);
        }
      }
      return { _type: "span" as const, _key: key(), text: n.text ?? "", marks };
    });
}

function blockFromParagraphLike(node: PMNode, style: string) {
  const markDefs: { _type: "link"; _key: string; href: string }[] = [];
  const children = spansFromInline(node.content, markDefs);
  if (children.length === 0) return null;
  return { _type: "block" as const, _key: key(), style, markDefs, children };
}

export function proseMirrorToPortableText(doc: PMNode): unknown[] {
  const blocks: unknown[] = [];

  function visit(node: PMNode, listItem?: "bullet" | "number", level = 1) {
    switch (node.type) {
      case "paragraph": {
        const block = blockFromParagraphLike(node, "normal");
        if (block) blocks.push(listItem ? { ...block, listItem, level } : block);
        return;
      }
      case "heading": {
        const level = typeof node.attrs?.level === "number" ? node.attrs.level : 2;
        const style = level <= 2 ? "h2" : "h3";
        const block = blockFromParagraphLike(node, style);
        if (block) blocks.push(block);
        return;
      }
      case "blockquote": {
        for (const child of node.content ?? []) {
          const block = blockFromParagraphLike(child, "blockquote");
          if (block) blocks.push(block);
        }
        return;
      }
      case "bulletList":
      case "orderedList": {
        const type = node.type === "bulletList" ? "bullet" : "number";
        for (const item of node.content ?? []) {
          for (const child of item.content ?? []) {
            visit(child, type, level);
          }
        }
        return;
      }
      default:
        for (const child of node.content ?? []) visit(child, listItem, level);
    }
  }

  for (const node of doc.content ?? []) visit(node);
  return blocks;
}

/** Plain-text fallback (e.g. for building an excerpt) from the same doc. */
export function proseMirrorToPlainText(doc: PMNode): string {
  const lines: string[] = [];
  function visit(node: PMNode) {
    if (node.type === "text" && node.text) {
      lines[lines.length - 1] = (lines[lines.length - 1] ?? "") + node.text;
      return;
    }
    if (["paragraph", "heading", "blockquote"].includes(node.type)) lines.push("");
    for (const child of node.content ?? []) visit(child);
  }
  for (const node of doc.content ?? []) visit(node);
  return lines.map((l) => l.trim()).filter(Boolean).join("\n\n");
}
