import { useState, useMemo, useEffect } from "react";
import { useClient } from "sanity";

type WpListItem = {
  wpId: number;
  title: string;
  link: string;
  date: string;
  excerpt: string;
  alreadyMigrated?: boolean;
};

type RowStatus = "idle" | "pending" | "success" | "error";

type RefOption = { _id: string; title: string };

const CATEGORY_OPTIONS = [
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

// Categories whose sub-category is a reference to an admin-managed document
// type, picked by title rather than from a fixed string list.
const REFERENCE_DOC_TYPE: Record<string, "mission" | "program" | "project" | "blogCategory"> = {
  Missions: "mission",
  Programs: "program",
  Projects: "project",
  Blogs: "blogCategory",
};

const REFERENCE_FIELD: Record<string, "subCategory" | "programSubCategory" | "projectSubCategory" | "blogSubCategory"> = {
  Missions: "subCategory",
  Programs: "programSubCategory",
  Projects: "projectSubCategory",
  Blogs: "blogSubCategory",
};

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    background: "#14151a",
    minHeight: "100vh",
    width: "100%",
  },
  page: {
    padding: 32,
    maxWidth: 960,
    margin: "0 auto",
    color: "#e3e3e6",
    fontFamily: "inherit",
  },
  h1: { fontSize: 20, fontWeight: 600, marginBottom: 4 },
  sub: { fontSize: 13, color: "#9a9ba3", marginBottom: 24 },
  row: { display: "flex", gap: 12, marginBottom: 16, alignItems: "center" },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #3a3b42",
    background: "#1a1b1e",
    color: "#e3e3e6",
    fontSize: 14,
  },
  select: {
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #3a3b42",
    background: "#1a1b1e",
    color: "#e3e3e6",
    fontSize: 14,
  },
  button: {
    padding: "10px 18px",
    borderRadius: 6,
    border: "none",
    background: "#3aa676",
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  buttonDisabled: { opacity: 0.5, cursor: "not-allowed" },
  error: { color: "#ff8080", fontSize: 13, marginBottom: 16 },
  list: { border: "1px solid #2e2f36", borderRadius: 8, overflow: "hidden" },
  listHeader: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "#1f2024", borderBottom: "1px solid #2e2f36", fontSize: 13, color: "#9a9ba3" },
  listRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderBottom: "1px solid #2e2f36", fontSize: 14 },
  rowTitle: { flex: 1 },
  rowDate: { color: "#9a9ba3", fontSize: 12, width: 90 },
  rowStatus: { width: 90, textAlign: "right", fontSize: 12 },
};

function statusColor(s: RowStatus) {
  if (s === "success") return "#5fd089";
  if (s === "error") return "#ff8080";
  if (s === "pending") return "#e6c25c";
  return "#6a6b73";
}

function statusLabel(s: RowStatus) {
  if (s === "success") return "Migrated";
  if (s === "error") return "Failed";
  if (s === "pending") return "Migrating…";
  return "";
}

export default function WpMigrationTool() {
  const client = useClient({ apiVersion: "2024-01-01" });
  const [url, setUrl] = useState("");
  const [siteUrl, setSiteUrl] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string | null>(null);
  const [posts, setPosts] = useState<WpListItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statuses, setStatuses] = useState<Record<number, RowStatus>>({});
  const [statusMessages, setStatusMessages] = useState<Record<number, string>>({});
  const [migrating, setMigrating] = useState(false);

  const [targetCategory, setTargetCategory] = useState("Blogs");
  const [publishMode, setPublishMode] = useState<"draft" | "published">("draft");

  // Reference options (mission/program/project docs) for whichever category
  // is currently selected, keyed by doc type so switching categories doesn't
  // re-fetch options already loaded.
  const [refOptionsByType, setRefOptionsByType] = useState<Record<string, RefOption[]>>({});
  const [targetRefId, setTargetRefId] = useState("");

  const refDocType = REFERENCE_DOC_TYPE[targetCategory];
  const refOptions = refDocType ? refOptionsByType[refDocType] : undefined;

  useEffect(() => {
    if (!refDocType || refOptionsByType[refDocType]) return;
    client
      .fetch<RefOption[]>(`*[_type == $type] | order(title asc) { _id, title }`, { type: refDocType })
      .then((options) => setRefOptionsByType((prev) => ({ ...prev, [refDocType]: options })))
      .catch(() => setRefOptionsByType((prev) => ({ ...prev, [refDocType]: [] })));
  }, [client, refDocType, refOptionsByType]);

  useEffect(() => {
    setTargetRefId(refOptions?.[0]?._id ?? "");
  }, [refDocType, refOptions]);

  const selectablePosts = useMemo(() => posts.filter((p) => !p.alreadyMigrated), [posts]);
  const allSelected = selectablePosts.length > 0 && selected.size === selectablePosts.length;

  async function handleFetch() {
    setLoading(true);
    setError(null);
    setPosts([]);
    setSelected(new Set());
    setStatuses({});
    try {
      const res = await fetch(`/api/migrate/list?url=${encodeURIComponent(url)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch articles");
      setSiteUrl(data.siteUrl);
      setCategoryName(data.categoryName);
      setPosts(data.posts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch articles");
    } finally {
      setLoading(false);
    }
  }

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(selectablePosts.map((p) => p.wpId)));
  }

  async function handleMigrate() {
    if (!siteUrl || selected.size === 0) return;
    setMigrating(true);
    const ids = Array.from(selected);
    for (const wpId of ids) {
      setStatuses((s) => ({ ...s, [wpId]: "pending" }));
      try {
        // Netlify's serverless functions hard-cap at 10–26s with no override,
        // so posts with many/large photos can't upload them all inside one
        // request. Instead: list the post's image URLs, upload each one via
        // its own short-lived request (the browser has no such timeout and
        // can run them in parallel), then send the final "assemble + save"
        // request with the pre-uploaded asset IDs — that step alone is fast.
        const imagesRes = await fetch(`/api/migrate/post-images?siteUrl=${encodeURIComponent(siteUrl)}&wpPostId=${wpId}`);
        const imagesData = await imagesRes.json();
        if (!imagesRes.ok) throw new Error(imagesData.error || "Failed to list images");

        const images: Record<string, string> = {};
        await Promise.all(
          (imagesData.srcs as string[]).map(async (src) => {
            const r = await fetch("/api/migrate/upload-image", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ src }),
            });
            const d = await r.json();
            if (r.ok && d.assetId) images[src] = d.assetId;
            // A single failed image shouldn't fail the whole post — migrateWpPost
            // treats a missing map entry as "skip this image".
          })
        );

        const res = await fetch("/api/migrate/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            siteUrl,
            wpPostId: wpId,
            category: targetCategory,
            referenceField: refDocType ? REFERENCE_FIELD[targetCategory] : undefined,
            referenceId: refDocType ? targetRefId : undefined,
            publish: publishMode === "published",
            images,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Migration failed");
        setStatuses((s) => ({ ...s, [wpId]: "success" }));
      } catch (e) {
        setStatuses((s) => ({ ...s, [wpId]: "error" }));
        setStatusMessages((m) => ({ ...m, [wpId]: e instanceof Error ? e.message : "Failed" }));
      }
    }
    setMigrating(false);
  }

  const summary = useMemo(() => {
    const done = Object.values(statuses).filter((s) => s === "success").length;
    const failed = Object.values(statuses).filter((s) => s === "error").length;
    return { done, failed };
  }, [statuses]);

  return (
    <div style={styles.wrapper}>
    <div style={styles.page}>
      <h1 style={styles.h1}>WordPress Migration</h1>
      <p style={styles.sub}>
        Paste a category archive URL (e.g. https://ccs-gm.co/category/pastors-devotion/), pick which
        articles to bring over, choose the destination category, and migrate. Articles are created as
        drafts — review and publish them in Articles afterward.
      </p>

      <div style={styles.row}>
        <input
          style={styles.input}
          placeholder="https://ccs-gm.co/category/pastors-devotion/"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          style={{ ...styles.button, ...(loading || !url ? styles.buttonDisabled : {}) }}
          disabled={loading || !url}
          onClick={handleFetch}
        >
          {loading ? "Fetching…" : "Fetch Articles"}
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {posts.length > 0 && (
        <>
          <div style={styles.row}>
            <span style={{ fontSize: 13, color: "#9a9ba3" }}>
              {categoryName} — {posts.length} article{posts.length === 1 ? "" : "s"} found
            </span>
          </div>

          <div style={{ ...styles.row, marginBottom: 12 }}>
            <select
              style={styles.select}
              value={targetCategory}
              onChange={(e) => setTargetCategory(e.target.value)}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {refDocType && (
              refOptions === undefined ? (
                <span style={{ fontSize: 13, color: "#9a9ba3" }}>Loading {targetCategory.toLowerCase()}…</span>
              ) : refOptions.length > 0 ? (
                <select
                  style={styles.select}
                  value={targetRefId}
                  onChange={(e) => setTargetRefId(e.target.value)}
                >
                  {refOptions.map((o) => (
                    <option key={o._id} value={o._id}>{o.title}</option>
                  ))}
                </select>
              ) : (
                <span style={{ fontSize: 13, color: "#9a9ba3" }}>
                  No {targetCategory.toLowerCase()} yet — add one under {targetCategory} first.
                </span>
              )
            )}
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#9a9ba3" }}>
              <input
                type="radio"
                name="publishMode"
                checked={publishMode === "draft"}
                onChange={() => setPublishMode("draft")}
              />
              Draft
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#9a9ba3" }}>
              <input
                type="radio"
                name="publishMode"
                checked={publishMode === "published"}
                onChange={() => setPublishMode("published")}
              />
              Published
            </label>
            <button
              style={{ ...styles.button, ...(migrating || selected.size === 0 ? styles.buttonDisabled : {}) }}
              disabled={migrating || selected.size === 0}
              onClick={handleMigrate}
            >
              {migrating ? "Migrating…" : `Migrate Selected (${selected.size})`}
            </button>
          </div>

          {(summary.done > 0 || summary.failed > 0) && (
            <div style={{ fontSize: 13, marginBottom: 12, color: "#9a9ba3" }}>
              {summary.done} migrated{summary.failed > 0 ? `, ${summary.failed} failed` : ""}
            </div>
          )}

          <div style={styles.list}>
            <div style={styles.listHeader}>
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              <span>Select all</span>
            </div>
            {posts.map((p) => {
              const status = statuses[p.wpId] ?? "idle";
              const disabled = migrating || p.alreadyMigrated;
              return (
                <div key={p.wpId} style={{ ...styles.listRow, opacity: p.alreadyMigrated ? 0.5 : 1 }}>
                  <input
                    type="checkbox"
                    checked={selected.has(p.wpId)}
                    disabled={disabled}
                    onChange={() => toggle(p.wpId)}
                  />
                  <span style={styles.rowTitle}>
                    <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ color: "#e3e3e6", textDecoration: "none" }}>
                      {p.title}
                    </a>
                  </span>
                  <span style={styles.rowDate}>{new Date(p.date).toLocaleDateString()}</span>
                  <span style={{ ...styles.rowStatus, color: p.alreadyMigrated ? "#6a6b73" : statusColor(status) }} title={statusMessages[p.wpId]}>
                    {p.alreadyMigrated ? "Already migrated" : statusLabel(status)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
    </div>
  );
}
