import type { NavbarProps } from "sanity";

// The default Studio navbar plus a one-click way back to the live site's
// homepage — without this, leaving the Studio meant hand-editing the URL
// from /studio/... back down to "/".
export default function StudioNavbar(props: NavbarProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "8px 12px",
          borderBottom: "1px solid var(--card-border-color)",
        }}
      >
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title="Go to Site"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 30,
            height: 30,
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/ccsgm-logo.png" alt="Go to Site" width={30} height={30} style={{ objectFit: "cover" }} />
        </a>
      </div>
      {props.renderDefault(props)}
    </div>
  );
}
