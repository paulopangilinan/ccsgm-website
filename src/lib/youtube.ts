export type YouTubeVideo = {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
};

function decodeHtml(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/");
}

export async function getChannelVideos(maxResults = 7): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const channelId = process.env.YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId || apiKey === "your-youtube-api-key") return [];

  // Use the uploads playlist (UU…) instead of the Search API.
  // playlistItems costs 1 quota unit vs 100 for search — avoids daily limit exhaustion.
  const uploadsPlaylistId = channelId.replace(/^UC/, "UU");

  const url =
    `https://www.googleapis.com/youtube/v3/playlistItems` +
    `?key=${apiKey}&playlistId=${uploadsPlaylistId}&part=snippet&maxResults=${maxResults}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];

  const data = await res.json();

  return (data.items ?? [])
    .filter((item: { snippet: { resourceId: { videoId?: string } } }) =>
      item.snippet.resourceId.videoId
    )
    .map((item: {
      snippet: {
        title: string;
        description: string;
        publishedAt: string;
        thumbnails: { medium?: { url: string }; default?: { url: string } };
        resourceId: { videoId: string };
      };
    }) => ({
      id: item.snippet.resourceId.videoId,
      title: decodeHtml(item.snippet.title),
      description: decodeHtml(item.snippet.description),
      publishedAt: item.snippet.publishedAt,
      thumbnail:
        item.snippet.thumbnails.medium?.url ??
        item.snippet.thumbnails.default?.url ??
        "",
    }));
}

export async function getPlaylistVideos(
  playlistId: string,
  maxResults = 6
): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey || apiKey === "your-youtube-api-key") return [];

  const url =
    `https://www.googleapis.com/youtube/v3/playlistItems` +
    `?key=${apiKey}&playlistId=${playlistId}&part=snippet&maxResults=${maxResults}`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return [];

  const data = await res.json();

  return (data.items ?? [])
    .filter((item: { snippet: { resourceId: { videoId?: string } } }) =>
      item.snippet.resourceId.videoId
    )
    .map((item: {
      snippet: {
        title: string;
        description: string;
        publishedAt: string;
        thumbnails: { medium?: { url: string }; default?: { url: string } };
        resourceId: { videoId: string };
      };
    }) => ({
      id: item.snippet.resourceId.videoId,
      title: decodeHtml(item.snippet.title),
      description: decodeHtml(item.snippet.description),
      publishedAt: item.snippet.publishedAt,
      thumbnail:
        item.snippet.thumbnails.medium?.url ??
        item.snippet.thumbnails.default?.url ??
        "",
    }));
}
