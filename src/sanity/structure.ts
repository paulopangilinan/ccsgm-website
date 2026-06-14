import type { StructureResolver } from "sanity/structure";
import { DocumentsIcon } from "@sanity/icons";

function postsByCategory(S: Parameters<StructureResolver>[0], title: string, filter: string) {
  return S.listItem()
    .title(title)
    .child(
      S.documentList()
        .title(title)
        .filter(`_type == "post" && (${filter})`)
        .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
    );
}

export const structure: StructureResolver = (S) =>
  S.list()
    .title("CCSGM")
    .items([
      S.listItem()
        .title("Articles")
        .icon(DocumentsIcon)
        .child(
          S.list()
            .title("Articles")
            .items([
              postsByCategory(S, "News & Events",     `category in ["News", "Events"]`),
              postsByCategory(S, "Sermons",            `category == "Sermons"`),
              postsByCategory(S, "Readings",           `category == "Readings"`),
              postsByCategory(S, "Sunday School",      `category == "Sunday School"`),
              postsByCategory(S, "Pastor's Devotion",  `category == "Pastor's Devotion"`),
              postsByCategory(S, "Testimonies",        `category == "Testimonies"`),
              postsByCategory(S, "Blogs",              `category == "Blogs"`),

              S.divider(),

              S.listItem()
                .title("Missions")
                .child(
                  S.list()
                    .title("Missions")
                    .items([
                      postsByCategory(S, "Surigao Missions", `category == "Missions" && subCategory == "Surigao"`),
                      postsByCategory(S, "Agusan Missions",  `category == "Missions" && subCategory == "Agusan"`),
                      postsByCategory(S, "All Missions",     `category == "Missions"`),
                    ])
                ),

              S.listItem()
                .title("Programs")
                .child(
                  S.list()
                    .title("Programs")
                    .items([
                      postsByCategory(S, "Church Extension Fellowship (CEF)", `category == "Programs" && programSubCategory == "CEF"`),
                      postsByCategory(S, "Summits & Conferences",             `category == "Programs" && programSubCategory == "Conferences"`),
                      postsByCategory(S, "All Programs",                      `category == "Programs"`),
                    ])
                ),

              postsByCategory(S, "Projects",   `category == "Projects"`),
              postsByCategory(S, "Ministries", `category == "Ministries"`),

              S.divider(),

              postsByCategory(S, "Youth",   `category == "Youth"`),
              postsByCategory(S, "Couples", `category == "Couples"`),
              postsByCategory(S, "Music",   `category == "Music"`),

              S.divider(),

              S.documentTypeListItem("post").title("All Articles"),
            ])
        ),
    ]);
