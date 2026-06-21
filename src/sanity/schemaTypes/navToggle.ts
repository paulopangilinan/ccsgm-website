import { defineField } from "sanity";

const MAX_NAV_ITEMS = 5;

/**
 * Shared "Show in Navigation" toggle for mission/program/project — capped at
 * MAX_NAV_ITEMS per type so the site nav's flyouts don't grow unbounded.
 * Counts sibling documents of the same `typeName` with the flag already on,
 * excluding the document being edited (covers both its published and draft id).
 */
export function showInNavField(typeName: string) {
  return defineField({
    name: "showInNav",
    title: "Show in Navigation",
    type: "boolean",
    description: `Show this as a link in the site navigation (max ${MAX_NAV_ITEMS} at a time).`,
    initialValue: false,
    validation: (Rule) =>
      Rule.custom(async (value, context) => {
        if (!value) return true;
        const id = context.document?._id;
        if (!id) return true;
        const publishedId = id.replace(/^drafts\./, "");
        const client = context.getClient({ apiVersion: "2024-01-01" });
        const count = await client.fetch<number>(
          `count(*[_type == $type && showInNav == true && !(_id in [$publishedId, $draftId])])`,
          { type: typeName, publishedId, draftId: `drafts.${publishedId}` }
        );
        return count < MAX_NAV_ITEMS
          ? true
          : `Only ${MAX_NAV_ITEMS} can be shown in navigation at a time — turn another one off first.`;
      }),
  });
}
