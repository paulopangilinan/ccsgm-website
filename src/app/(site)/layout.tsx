import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getNavItems } from "@/lib/taxonomy";

export const revalidate = 60;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CCSGM — Cross of Christ Salvation Gospel Ministries",
    template: "%s | CCSGM",
  },
  description:
    "Cross of Christ Salvation Gospel Ministries — a Christian Evangelical Church in the Philippines, passionate in advancing the Great Commission through church planting and equipping local churches.",
  keywords: ["CCSGM", "church", "Philippines", "Cavite", "evangelical", "gospel"],
};

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [missionNavItems, programNavItems, projectNavItems] = await Promise.all([
    getNavItems("mission"),
    getNavItems("program"),
    getNavItems("project"),
  ]);

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Navbar
          missionNavItems={missionNavItems}
          programNavItems={programNavItems}
          projectNavItems={projectNavItems}
        />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
