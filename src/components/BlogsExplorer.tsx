"use client";

import { useMemo, useState } from "react";
import PostGrid, { type Post } from "@/components/PostGrid";

const TOPICS = ["Pastor's Devotion", "Youth", "Couples", "Music"];

type SortOrder = "newest" | "oldest";

export default function BlogsExplorer({ posts }: { posts: Post[] }) {
  const [topic, setTopic] = useState<string>("All");
  const [sort, setSort] = useState<SortOrder>("newest");

  const availableTopics = useMemo(
    () => TOPICS.filter((t) => posts.some((p) => p.blogSubCategory === t)),
    [posts]
  );

  const visiblePosts = useMemo(() => {
    const filtered = topic === "All" ? posts : posts.filter((p) => p.blogSubCategory === topic);
    const sorted = [...filtered].sort((a, b) => {
      const da = new Date(a.publishedAt).getTime();
      const db = new Date(b.publishedAt).getTime();
      return sort === "newest" ? db - da : da - db;
    });
    return sorted;
  }, [posts, topic, sort]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {["All", ...availableTopics].map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                topic === t
                  ? "bg-[#1a4731] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t}
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
