"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import PostGrid, { type Post } from "@/components/PostGrid";

type BlogCategory = { _id: string; title: string };

type SortOrder = "newest" | "oldest";

const PAGE_SIZE = 12;

function postMatchesTopic(post: Post, topic: BlogCategory): boolean {
  if (typeof post.blogSubCategory === "object" && post.blogSubCategory?._id === topic._id) return true;
  return post.tags?.includes(topic.title) ?? false;
}

export default function BlogsExplorer({ posts, categories }: { posts: Post[]; categories: BlogCategory[] }) {
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortOrder>("newest");
  const [page, setPage] = useState(1);

  const availableTopics = useMemo(
    () => categories.filter((c) => posts.some((p) => postMatchesTopic(p, c))),
    [posts, categories]
  );

  function toggleTopic(id: string) {
    setSelectedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const filteredPosts = useMemo(() => {
    const filtered =
      selectedTopics.size === 0
        ? posts
        : posts.filter((p) => categories.some((c) => selectedTopics.has(c._id) && postMatchesTopic(p, c)));
    return [...filtered].sort((a, b) => {
      const da = new Date(a.publishedAt).getTime();
      const db = new Date(b.publishedAt).getTime();
      return sort === "newest" ? db - da : da - db;
    });
  }, [posts, selectedTopics, sort, categories]);

  // Filtering/sorting changes the result set — always land back on page 1.
  useEffect(() => {
    setPage(1);
  }, [selectedTopics, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE));
  const visiblePosts = filteredPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTopics(new Set())}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
              selectedTopics.size === 0
                ? "bg-[#1a4731] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All
          </button>
          {availableTopics.map((c) => (
            <button
              key={c._id}
              onClick={() => toggleTopic(c._id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                selectedTopics.has(c._id)
                  ? "bg-[#1a4731] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {c.title}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOrder)}
          className="w-full sm:w-auto text-sm font-medium text-gray-600 border border-gray-200 rounded-full px-4 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#52b788]"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <PostGrid posts={visiblePosts} emptyMessage="No blog posts in this topic yet." />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label="Previous page"
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-[#1a4731] hover:bg-[#f0fdf4] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label="Next page"
            className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-[#1a4731] hover:bg-[#f0fdf4] disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
