import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
