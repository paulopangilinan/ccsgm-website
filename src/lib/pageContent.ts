import { client } from "@/sanity/client";

export async function getPageContent(id: string): Promise<unknown[] | null> {
  try {
    const doc = await client.fetch<{ body?: unknown[] } | null>(
      `*[_id == $id][0]{ body }`,
      { id }
    );
    return doc?.body ?? null;
  } catch {
    return null;
  }
}
