import type { Metadata } from "next";
import ShareStoryClient from "./ShareStoryClient";

export const metadata: Metadata = {
  title: "Share Your Story",
  description:
    "Share your testimony, devotion, praise report, or prayer request with the CCSGM community.",
};

export default function ShareYourStoryPage() {
  return <ShareStoryClient />;
}
