import { NextResponse } from "next/server";

const cacheHeaders = {
  "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
};

// Only display source-provided articles with usable links and publication dates.
function isArticle(article) {
  if (!article || typeof article.title !== "string" || !article.title.trim()) return false;
  if (typeof article.publishedAt !== "string" || !Number.isFinite(Date.parse(article.publishedAt))) return false;
  try {
    const url = new URL(article.url);
    return ["https:", "http:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export async function GET() {
  const unavailable = () => NextResponse.json(
    { articles: [], status: "unavailable" }, { headers: cacheHeaders }
  );
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return unavailable();

  try {
    const res = await fetch(
      `https://newsapi.org/v2/everything?q="aaron judge"&sortBy=publishedAt&pageSize=12&language=en`,
      { headers: { "X-Api-Key": apiKey }, next: { revalidate: 900 } }
    );
    if (!res.ok) return unavailable();
    const data = await res.json();
    if (data.status !== "ok" || !Array.isArray(data.articles)) return unavailable();
    const articles = data.articles.filter(isArticle);
    return NextResponse.json(
      { articles, status: articles.length ? "ok" : "empty" },
      { headers: cacheHeaders }
    );
  } catch {
    return unavailable();
  }
}
