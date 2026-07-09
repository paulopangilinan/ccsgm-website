"use client";

import { useState } from "react";

export default function BPILogo() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className="text-4xl font-black tracking-tight" style={{ color: "#BA272D" }}>
        BPI
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/giving/bpi-logo.png"
      alt="BPI"
      className="h-14 object-contain"
      onError={() => setFailed(true)}
    />
  );
}
