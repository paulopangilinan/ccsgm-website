import type { StructureResolver } from "sanity/structure";
import { DocumentsIcon } from "@sanity/icons";

function postsByCategory(
  S: Parameters<StructureResolver>[0],
  title: string,
  filter: string,
  templateId?: string
) {
  return S.listItem()
    .title(title)
    .child(
      S.documentList()
        .title(title)
        .filter(`_type == "post" && (${filter})`)
        .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
        .initialValueTemplates(
          templateId ? [S.initialValueTemplateItem(templateId)] : []
        )
    );
}

// Each page-content slot is a fixed-id singleton (one editable block per spot
// on a page), not something editors create new instances of.
// IMPORTANT: never put a "." in `id` — Sanity reserves dotted IDs for internal
// namespacing (drafts.*, versions.*) and silently excludes them from
// anonymous/public reads regardless of document type. Use hyphens instead.
function pageContentSingleton(
  S: Parameters<StructureResolver>[0],
  title: string,
  id: string
) {
  return S.listItem()
    .title(title)
    .id(id)
    .child(S.document().schemaType("pageContent").documentId(id));
}

// Mirrors the site's own navigation (see src/components/Navbar.tsx) rather
// than a CMS-internal taxonomy — each page you'd find in the site nav has one
// place here with everything that belongs to it (its editable page content,
// if any, alongside its articles), instead of articles and page content
// living in separate top-level sections.
export const structure: StructureResolver = (S) =>
  S.list()
    .title("CCSGM")
    .items([
      S.listItem()
        .title("Home Page")
        .id("home-page")
        .child(S.document().schemaType("homePage").documentId("home-page")),

      S.listItem()
        .title("About Page")
        .id("about-page")
        .child(S.document().schemaType("aboutPage").documentId("about-page")),

      S.listItem()
        .title("Locations Page")
        .id("locations-page")
        .child(S.document().schemaType("locationsPage").documentId("locations-page")),

      S.listItem()
        .title("Site Settings")
        .id("site-settings")
        .child(S.document().schemaType("siteSettings").documentId("site-settings")),

      S.listItem()
        .title("Preaching")
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title("Preaching")
            .items([
              S.listItem()
                .title("Sermons")
                .id("sermonSettings")
                .child(S.document().schemaType("sermonSettings").documentId("sermonSettings")),

              S.listItem()
                .title("Sunday School")
                .child(
                  S.list()
                    .title("Sunday School")
                    .items([
                      pageContentSingleton(S, "Page Content", "pageContent-sunday-school"),
                      postsByCategory(S, "Articles", `category == "Sunday School"`, "post-sunday-school"),
                    ])
                ),

              postsByCategory(S, "Testimonies", `category == "Testimonies"`, "post-testimonies"),
              postsByCategory(S, "Readings",    `category == "Readings"`,    "post-readings"),

              S.listItem()
                .title("Blogs")
                .child(
                  S.list()
                    .title("Blogs")
                    .items([
                      S.documentTypeListItem("blogCategory").title("Blog Categories"),
                      postsByCategory(S, "Articles", `category == "Blogs"`, "post-blogs"),
                    ])
                ),
            ])
        ),

      S.listItem()
        .title("Missions")
        .child(
          S.list()
            .title("Missions")
            .items([
              S.documentTypeListItem("mission").title("Missions"),
              postsByCategory(S, "Articles", `category == "Missions"`, "post-missions"),
            ])
        ),

      S.listItem()
        .title("Programs")
        .child(
          S.list()
            .title("Programs")
            .items([
              S.documentTypeListItem("program").title("Programs"),
              postsByCategory(S, "Articles", `category == "Programs"`, "post-programs"),
            ])
        ),

      S.listItem()
        .title("Projects")
        .child(
          S.list()
            .title("Projects")
            .items([
              S.documentTypeListItem("project").title("Projects"),
              postsByCategory(S, "Articles", `category == "Projects"`, "post-projects"),
            ])
        ),

      S.listItem()
        .title("News & Events")
        .child(
          S.list()
            .title("News & Events")
            .items([
              postsByCategory(S, "News",               `category == "News"`,           "post-news"),
              postsByCategory(S, "Events",              `category == "Events"`,         "post-events"),
              postsByCategory(S, "All News & Events",   `category in ["News","Events"]`),
            ])
        ),

      S.divider(),

      S.documentTypeListItem("post").title("All Articles"),
    ]);
