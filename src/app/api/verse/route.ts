import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const ref = req.nextUrl.searchParams.get("ref");
  if (!ref) return NextResponse.json({ error: "Missing ref" }, { status: 400 });

  const key = process.env.ESV_API_KEY;
  if (!key) return NextResponse.json({ error: "No API key" }, { status: 500 });

  const url =
    `https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(ref)}` +
    `&include-headings=false&include-footnotes=false&include-verse-numbers=false` +
    `&include-short-copyright=false&include-passage-references=false`;

  const res = await fetch(url, {
    headers: { Authorization: `Token ${key}` },
    next: { revalidate: 86400 },
  });

  if (!res.ok) return NextResponse.json({ error: "ESV fetch failed" }, { status: res.status });

  const data = await res.json();
  const text: string = (data.passages?.[0] ?? "").trim().replace(/\s+/g, " ");
  return NextResponse.json({ text });
}
