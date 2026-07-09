"use client";

import { useState } from "react";

export default function GCashLogo() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="text-2xl font-bold tracking-wide text-white">
        GCash
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/giving/gcash-logo.png"
      alt="GCash"
      className="h-20 object-contain"
      onError={() => setFailed(true)}
    />
  );
}
