"use client";

import { useState } from "react";
import Image from "next/image";

type HeroSectionProps = {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  imageName?: string; // matches /public/images/hero-headers/{imageName}.png
  imageUrl?: string;  // full URL from Sanity (takes priority over imageName)
  children?: React.ReactNode;
};

export default function HeroSection({
  eyebrow,
  title,
  subtitle,
  imageName,
  imageUrl,
  children,
}: HeroSectionProps) {
  const [imageError, setImageError] = useState(false);
  const imageSrc = imageUrl ?? (imageName ? `/images/hero-headers/${imageName}.png` : null);

  const hasImage = !!imageSrc && !imageError;

  return (
    <section className="relative bg-[#1a4731] text-white overflow-hidden min-h-[420px]">
      {/* Background image — occupies right half only */}
      {hasImage && (
        <>
          <div className="absolute top-0 right-0 h-full w-3/4">
            <Image
              src={imageSrc!}
              alt=""
              fill
              className="object-cover object-center"
              onError={() => setImageError(true)}
              priority
            />
          </div>
          {/* Fade: dark green on left bleeding into the image */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, #1a4731 40%, #1a4731ee 55%, #1a473199 70%, transparent 100%)",
            }}
          />
        </>
      )}

      {/* Decorative fallback when no image */}
      {!hasImage && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large faint circle top-right */}
          <div
            className="absolute -top-24 -right-24 w-[480px] h-[480px] rounded-full"
            style={{ background: "radial-gradient(circle, #52b78818 0%, transparent 70%)" }}
          />
          {/* Medium circle bottom-right */}
          <div
            className="absolute -bottom-16 right-32 w-72 h-72 rounded-full"
            style={{ background: "radial-gradient(circle, #52b78812 0%, transparent 70%)" }}
          />
          {/* Subtle cross pattern */}
          <svg
            className="absolute right-0 top-0 h-full w-1/2 opacity-[0.04]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="cross" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 0 v40 M0 20 h40" stroke="white" strokeWidth="1" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#cross)" />
          </svg>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="max-w-xl">
          {eyebrow && (
            <p className="text-[#52b788] text-sm font-semibold uppercase tracking-widest mb-3">
              {eyebrow}
            </p>
          )}
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-300 max-w-lg leading-relaxed">{subtitle}</p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
