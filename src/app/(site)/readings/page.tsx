import type { Metadata } from "next";
import { client } from "@/sanity/client";
import PostGrid, { type Post } from "@/components/PostGrid";
import SessionRow from "@/components/ReadingModal";
import HeroSection from "@/components/HeroSection";

export const metadata: Metadata = {
  title: "Readings",
  description: "Downloadable preachings and study materials from CCSGM.",
};

export const revalidate = 60;

type Session = {
  title: string;
  speaker: string;
  url?: string;
};

type Conference = {
  name: string;
  copyright?: string;
  sessions: Session[];
};

const conferences: Conference[] = [
  {
    name: "Leadership Summit 2020",
    copyright: "Sovereign Grace Churches",
    sessions: [
      {
        title: "Marriage and the High Call of Husbands",
        speaker: "Ptr. Dave Taylor",
        url: "https://drive.google.com/file/d/18V1POZC0CDekgvVmrBuvja7SoS4bm-Yn/view?usp=sharing",
      },
      {
        title: "Marriage and the High Call of Wives",
        speaker: "Ptr. Dave Taylor",
        url: "https://drive.google.com/file/d/1zo3G4-GoK6vl5pfRDLrr4AfcO466c6oz/view?usp=sharing",
      },
      {
        title: "Gospel Centered Parenting",
        speaker: "Ptr. Lynn Baird",
        url: "https://drive.google.com/file/d/1MMZV8bKOEIU1GgtFrKHfR1Vlg30Emd-Y/view?usp=sharing",
      },
    ],
  },
  {
    name: "Pastors and Wives Convention 2020",
    copyright: "Sovereign Grace Churches",
    sessions: [
      { title: "The Church – The Dearest Place on Earth", speaker: "Ptr. Dave Taylor" },
      { title: "Leadership and The Dearest Place on Earth", speaker: "Ptr. Dave Taylor" },
      { title: "The Dearest Book and The Dearest Place on Earth", speaker: "Ptr. Lynn Baird" },
      { title: "The Gospel and The Dearest Place on Earth", speaker: "" },
      { title: "Family and The Dearest Place on Earth", speaker: "" },
      { title: "Partnership and The Dearest Place on Earth", speaker: "" },
      { title: "Perspective and The Dearest Place on Earth", speaker: "" },
      { title: "Worship and The Dearest Place on Earth", speaker: "Ptr. Lynn Baird" },
      { title: "Faith and The Dearest Place on Earth", speaker: "" },
    ],
  },
  {
    name: "Pastors and Wives Convention 2019",
    copyright: "Sovereign Grace Churches",
    sessions: [
      {
        title: "Always Faithful",
        speaker: "Ptr. Dave York",
        url: "https://drive.google.com/file/d/1_nDlfYOygdc8LPI3jwOcL-jcT-gx6kxZ/view?usp=sharing",
      },
      {
        title: "Equal yet Different",
        speaker: "Ptr. Dave Taylor",
        url: "https://drive.google.com/file/d/1EIOJx6fkXkdEJMQFTRe200z6wUsyEptT/view?usp=sharing",
      },
      {
        title: "God's Grand Design for Husbands — Understanding the Role of Husbands",
        speaker: "Ptr. Dave Taylor",
        url: "https://drive.google.com/file/d/1qKXs7VlYmsMYSNcxFSFNRMQ3C6xexeNF/view?usp=sharing",
      },
      {
        title: "God's Grand Design for Wives",
        speaker: "Ptr. Dave York",
        url: "https://drive.google.com/file/d/1ZVC3PO5Uvgv54P4Sx-p_pO43m-76M-Ve/view?usp=sharing",
      },
      {
        title: "Manhood and Womanhood in All of Life",
        speaker: "Ptr. Dave Taylor",
        url: "https://drive.google.com/file/d/193TdtivOIiX-XhdV4S1_AxGlDTC7K_uh/view?usp=sharing",
      },
      {
        title: "Manhood and Womanhood in the Church",
        speaker: "Ptr. Dave Taylor",
      },
      {
        title: "The Priority and Power of the Word",
        speaker: "Ptr. Lynn Baird",
        url: "https://drive.google.com/file/d/1Fx9CHRh6fioBwZvIVtmaz8RPvZjxSpkh/view?usp=sharing",
      },
      {
        title: "The Life and Work of Martin Luther — Couples Convention 2019",
        speaker: "Ptr. Lynn Baird",
        url: "https://drive.google.com/file/d/1OWgWGo1jsgbZHDDYVNVqf-O-PMpeSiMx/view?usp=sharing",
      },
      {
        title: "When People Are Big and God Is Small",
        speaker: "Ptr. Dave Taylor",
        url: "https://drive.google.com/file/d/1ivVH0t9CSRqwE1qkMYSm9LPNC3ZWdHCD/view?usp=sharing",
      },
    ],
  },
];

async function getSanityPosts(): Promise<Post[]> {
  try {
    return await client.fetch<Post[]>(
      `*[_type == "post" && (category == "Readings" || (category == "Blogs" && blogSubCategory->title == "Pastor's Devotion"))] | order(publishedAt desc) {
        _id, slug, category, blogSubCategory->{_id, title}, tags, title, excerpt, publishedAt, author, mainImage
      }`
    );
  } catch {
    return [];
  }
}

export default async function ReadingsPage() {
  const posts = await getSanityPosts();

  return (
    <>
      <HeroSection
        eyebrow="Preaching"
        title="Readings"
        subtitle="CCSGM has a heart in learning the Gospel through the Bible. Feel free to download the preachings below for your personal or group study. Just click the title of the preaching. By the grace of God, may this learning be applied in our lives."
        imageName="readings"
      />

      {/* Conferences */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {conferences.map((conf) => (
            <div key={conf.name}>
              <div className="flex items-start justify-between mb-1">
                <h2 className="text-xl font-bold text-[#1a4731]">{conf.name}</h2>
              </div>
              {conf.copyright && (
                <p className="text-xs text-gray-400 mb-5">
                  © {conf.copyright}
                </p>
              )}
              <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden">
                {conf.sessions.map((session, i) => (
                  <SessionRow key={i} session={session} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sanity articles */}
      {posts.length > 0 && (
        <section className="py-20 bg-[#f0fdf4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[#1a4731] mb-8">
              Articles
            </h2>
            <PostGrid posts={posts} />
          </div>
        </section>
      )}
    </>
  );
}
