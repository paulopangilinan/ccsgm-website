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

export const structure: StructureResolver = (S) =>
  S.list()
    .title("CCSGM")
    .items([
      S.listItem()
        .title("Sermon Settings")
        .id("sermonSettings")
        .child(
          S.document()
            .schemaType("sermonSettings")
            .documentId("sermonSettings")
        ),

      S.divider(),

      S.listItem()
        .title("Articles")
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title("Articles")
            .items([
              postsByCategory(S, "News",              `category == "News"`,             "post-news"),
              postsByCategory(S, "Events",             `category == "Events"`,           "post-events"),
              postsByCategory(S, "Readings",           `category == "Readings"`,         "post-readings"),
              postsByCategory(S, "Sunday School",      `category == "Sunday School"`,    "post-sunday-school"),
              postsByCategory(S, "Testimonies",        `category == "Testimonies"`,      "post-testimonies"),

              S.divider(),

              S.listItem()
                .title("Missions")
                .child(
                  S.list()
                    .title("Missions")
                    .items([
                      postsByCategory(S, "Surigao Missions", `category == "Missions" && subCategory == "Surigao"`, "post-missions-surigao"),
                      postsByCategory(S, "Agusan Missions",  `category == "Missions" && subCategory == "Agusan"`,  "post-missions-agusan"),
                      postsByCategory(S, "All Missions",     `category == "Missions"`),
                    ])
                ),

              S.listItem()
                .title("Programs")
                .child(
                  S.list()
                    .title("Programs")
                    .items([
                      postsByCategory(S, "Church Extension Fellowship (CEF)", `category == "Programs" && programSubCategory == "CEF"`,         "post-programs-cef"),
                      postsByCategory(S, "Summits & Conferences",             `category == "Programs" && programSubCategory == "Conferences"`, "post-programs-conference"),
                      postsByCategory(S, "One Worship",                       `category == "Programs" && programSubCategory == "One Worship"`, "post-programs-one-worship"),
                      postsByCategory(S, "All Programs",                      `category == "Programs"`),
                    ])
                ),

              postsByCategory(S, "Projects", `category == "Projects"`, "post-projects"),

              S.divider(),

              S.listItem()
                .title("Blogs")
                .child(
                  S.list()
                    .title("Blogs")
                    .items([
                      postsByCategory(S, "Pastor's Devotion", `category == "Blogs" && blogSubCategory == "Pastor's Devotion"`, "post-blogs-pastors-devotion"),
                      postsByCategory(S, "Youth",              `category == "Blogs" && blogSubCategory == "Youth"`,             "post-blogs-youth"),
                      postsByCategory(S, "Couples",            `category == "Blogs" && blogSubCategory == "Couples"`,           "post-blogs-couples"),
                      postsByCategory(S, "Music",              `category == "Blogs" && blogSubCategory == "Music"`,             "post-blogs-music"),
                      postsByCategory(S, "All Blogs",          `category == "Blogs"`),
                    ])
                ),

              S.divider(),

              S.documentTypeListItem("post").title("All Articles"),
            ])
        ),
    ]);
