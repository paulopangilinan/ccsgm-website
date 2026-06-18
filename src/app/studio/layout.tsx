/**
 * Independent root layout for /studio — deliberately does NOT inherit the
 * marketing site's layout (Navbar/Footer/Tailwind globals.css). Sanity Studio
 * expects to own the full viewport itself: its document pane manages its own
 * internal scrolling with a sticky action footer (Publish/Delete). Nesting it
 * inside the site's flex/min-h-full body made the whole page scroll instead,
 * dragging those action buttons out of view on long documents.
 */
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
