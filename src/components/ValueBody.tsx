import VerseTooltip from "./VerseTooltip";

type Part =
  | { type: "text"; content: string }
  | { type: "verses"; refs: string[] };

function parse(body: string): Part[] {
  // Match parenthetical groups that contain at least one verse reference (digit:digit)
  const pattern = /\(([^)]*\d+:\d+[^)]*)\)/g;
  const parts: Part[] = [];
  let cursor = 0;
  let m: RegExpExecArray | null;

  while ((m = pattern.exec(body)) !== null) {
    if (m.index > cursor) {
      parts.push({ type: "text", content: body.slice(cursor, m.index) });
    }
    const refs = m[1]
      .split(";")
      .map((r) => r.trim())
      .filter(Boolean);
    parts.push({ type: "verses", refs });
    cursor = m.index + m[0].length;
  }

  if (cursor < body.length) {
    parts.push({ type: "text", content: body.slice(cursor) });
  }

  return parts;
}

export default function ValueBody({ text }: { text: string }) {
  return (
    <>
      {parse(text).map((part, i) => {
        if (part.type === "text") {
          return <span key={i}>{part.content}</span>;
        }
        return (
          <span key={i}>
            (
            {part.refs.map((ref, j) => (
              <span key={j}>
                <VerseTooltip reference={ref} />
                {j < part.refs.length - 1 && "; "}
              </span>
            ))}
            )
          </span>
        );
      })}
    </>
  );
}
