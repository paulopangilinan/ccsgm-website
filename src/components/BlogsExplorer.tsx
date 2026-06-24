"use client";

import { useMemo, useState } from "react";
import PostGrid, { type Post } from "@/components/PostGrid";

type BlogCategory = { _id: string; title: string };

type SortOrder = "newest" | "oldest";

function postMatchesTopic(post: Post, topic: BlogCategory): boolean {
  if (typeof post.blogSubCategory === "object" && post.blogSubCategory?._id === topic._id) return true;
  return post.tags?.includes(topic.title) ?? false;
}

export default function BlogsExplorer({ posts, categories }: { posts: Post[]; categories: BlogCategory[] }) {
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortOrder>("newest");

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

  const visiblePosts = useMemo(() => {
    const filtered =
      selectedTopics.size === 0
        ? posts
        : posts.filter((p) => categories.some((c) => selectedTopics.has(c._id) && postMatchesTopic(p, c)));
    const sorted = [...filtered].sort((a, b) => {
      const da = new Date(a.publishedAt).getTime();
      const db = new Date(b.publishedAt).getTime();
      return sort === "newest" ? db - da : da - db;
    });
    return sorted;
  }, [posts, selectedTopics, sort, categories]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
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
          className="text-sm font-medium text-gray-600 border border-gray-200 rounded-full px-4 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#52b788]"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <PostGrid posts={visiblePosts} emptyMessage="No blog posts in this topic yet." />
    </div>
  );
}
