import { useState, useMemo } from "react";

type WpListItem = {
  wpId: number;
  title: string;
  link: string;
  date: string;
  excerpt: string;
};

type RowStatus = "idle" | "pending" | "success" | "error";

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

const SUB_CATEGORY_CONFIG: Record<string, { field: "subCategory" | "programSubCategory" | "blogSubCategory"; label: string; options: string[] }> = {
  Missions: { field: "subCategory", label: "Mission Location", options: ["Surigao", "Agusan"] },
  Programs: { field: "programSubCategory", label: "Program", options: ["CEF", "Conferences", "One Worship"] },
  Blogs: { field: "blogSubCategory", label: "Blog Topic", options: ["Pastor's Devotion", "Youth", "Couples", "Music"] },
};

const styles: Record<string, React.CSSProperties> = {
  page: { padding: 32, maxWidth: 960, margin: "0 auto", color: "#e3e3e6", fontFamily: "inherit" },
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
  const [targetSubCategory, setTargetSubCategory] = useState("Pastor's Devotion");

  const subConfig = SUB_CATEGORY_CONFIG[targetCategory];

  const allSelected = posts.length > 0 && selected.size === posts.length;

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
    setSelected(allSelected ? new Set() : new Set(posts.map((p) => p.wpId)));
  }

  async function handleMigrate() {
    if (!siteUrl || selected.size === 0) return;
    setMigrating(true);
    const ids = Array.from(selected);
    for (const wpId of ids) {
      setStatuses((s) => ({ ...s, [wpId]: "pending" }));
      try {
        const res = await fetch("/api/migrate/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            siteUrl,
            wpPostId: wpId,
            category: targetCategory,
            subCategoryField: subConfig?.field,
            subCategoryValue: subConfig ? targetSubCategory : undefined,
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
              onChange={(e) => {
                setTargetCategory(e.target.value);
                const cfg = SUB_CATEGORY_CONFIG[e.target.value];
                setTargetSubCategory(cfg ? cfg.options[0] : "");
              }}
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {subConfig && (
              <select
                style={styles.select}
                value={targetSubCategory}
                onChange={(e) => setTargetSubCategory(e.target.value)}
              >
                {subConfig.options.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            )}
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
              return (
                <div key={p.wpId} style={styles.listRow}>
                  <input
                    type="checkbox"
                    checked={selected.has(p.wpId)}
                    disabled={migrating}
                    onChange={() => toggle(p.wpId)}
                  />
                  <span style={styles.rowTitle}>
                    <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ color: "#e3e3e6", textDecoration: "none" }}>
                      {p.title}
                    </a>
                  </span>
                  <span style={styles.rowDate}>{new Date(p.date).toLocaleDateString()}</span>
                  <span style={{ ...styles.rowStatus, color: statusColor(status) }} title={statusMessages[p.wpId]}>
                    {statusLabel(status)}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
