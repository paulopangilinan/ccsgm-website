import { useEffect, useState, useCallback } from "react";
import { set, unset, useClient, type ArrayOfPrimitivesInputProps } from "sanity";

// Mirrors `post.category`'s fixed options — these never come from a
// document type, so they're hardcoded here same as in post.ts.
const BASE_CATEGORIES = [
  "News",
  "Events",
  "Testimonies",
  "Readings",
  "Projects",
  "Sunday School",
  "Missions",
  "Programs",
  "Blogs",
];

const styles: Record<string, React.CSSProperties> = {
  wrap: { display: "flex", flexWrap: "wrap", gap: 8 },
  tag: {
    padding: "6px 12px",
    borderRadius: 999,
    fontSize: 13,
    border: "1px solid #d0d5dd",
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
  },
  tagActive: {
    background: "#3aa676",
    borderColor: "#3aa676",
    color: "#fff",
    fontWeight: 600,
  },
};

/**
 * Renders `post.tags` as a multi-select of chips instead of Studio's default
 * array-of-strings editor — the selectable options are fetched live (mission,
 * program, project, and blog category titles, plus the fixed top-level
 * categories) so a newly-added mission/program/project/blog category becomes
 * choosable here immediately, the same way the WP Migration tool's
 * reference pickers stay in sync without a code change.
 */
export function TagsInput(props: ArrayOfPrimitivesInputProps) {
  const { value, onChange } = props;
  const client = useClient({ apiVersion: "2024-01-01" });
  const [options, setOptions] = useState<string[] | null>(null);

  useEffect(() => {
    client
      .fetch<string[]>(`*[_type in ["mission", "program", "project", "blogCategory"]].title`)
      .then((titles) => {
        const all = Array.from(new Set([...BASE_CATEGORIES, ...titles])).sort();
        setOptions(all);
      })
      .catch(() => setOptions(BASE_CATEGORIES));
  }, [client]);

  const toggle = useCallback(
    (tag: string) => {
      const current = (value ?? []) as string[];
      const next = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
      onChange(next.length > 0 ? set(next) : unset());
    },
    [value, onChange]
  );

  if (!options) return <span style={{ fontSize: 13, color: "#9a9ba3" }}>Loading tags…</span>;

  // Tags already on this document that no longer match a live option (e.g. a
  // mission/program was renamed since this post was tagged) — shown anyway so
  // they're visible and removable instead of silently disappearing.
  const currentValue = (value ?? []) as string[];
  const orphaned = currentValue.filter((t) => !options.includes(t));
  const allTags = [...options, ...orphaned];

  return (
    <div style={styles.wrap}>
      {allTags.map((tag) => {
        const active = currentValue.includes(tag);
        return (
          <button
            key={tag}
            type="button"
            title={orphaned.includes(tag) ? "No longer a live option — click to remove" : undefined}
            style={active ? { ...styles.tag, ...styles.tagActive } : styles.tag}
            onClick={() => toggle(tag)}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
}
