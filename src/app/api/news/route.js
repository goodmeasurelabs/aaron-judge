import { NextResponse } from "next/server";

const cacheHeaders = {
  "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
};

function isWebUrl(value) {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol);
  } catch {
    return false;
  }
}

// Only display source-provided articles with usable links and publication dates.
function isArticle(article) {
  return article && typeof article.title === "string" && article.title.trim() &&
    typeof article.publishedAt === "string" && Number.isFinite(Date.parse(article.publishedAt)) &&
    isWebUrl(article.url);
}

function optionalText(value) {
  return typeof value === "string" ? value : null;
}

function normalizeArticle(article) {
  return {
    title: article.title,
    url: article.url,
    publishedAt: article.publishedAt,
    source: { name: optionalText(article.source?.name) },
    description: optionalText(article.description),
    urlToImage: isWebUrl(article.urlToImage) ? article.urlToImage : null,
  };
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
    const articles = data.articles.filter(isArticle).map(normalizeArticle);
    return NextResponse.json(
      { articles, status: articles.length ? "ok" : "empty" },
      { headers: cacheHeaders }
    );
  } catch {
    return unavailable();
  }
}
