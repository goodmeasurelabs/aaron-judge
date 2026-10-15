"use client";

import { useState, useEffect } from "react";
import { trackOutboundClick } from "@/lib/analytics";

export default function NewsFeed() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("unavailable");

  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch("/api/news");
        if (!res.ok) throw new Error("News unavailable");
        const data = await res.json();
        setArticles(Array.isArray(data.articles) ? data.articles : []);
        setStatus(data.status || "unavailable");
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="h-40 bg-gray-700 rounded-md mb-4" />
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-700 rounded w-1/2 mb-4" />
            <div className="h-3 bg-gray-700 rounded w-full mb-2" />
            <div className="h-3 bg-gray-700 rounded w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return <p role="status" className="text-gray-400 text-center">{status === "empty" ? "No news articles are available right now." : "News is temporarily unavailable. Please check back later."}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {articles.map((article, i) => (
        <article key={i} className="card flex flex-col">
          {article.urlToImage ? (
            <img
              src={article.urlToImage}
              alt={article.title}
              className="w-full h-40 object-cover rounded-md mb-4"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-40 rounded-md mb-4 bg-gradient-to-br from-blue-900 to-gray-800 flex items-center justify-center">
              <span className="text-3xl font-bold text-white/20">AJ</span>
            </div>
          )}

          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackOutboundClick({ url: article.url, link_text: article.title, link_location: 'news_feed' })}
            className="text-lg font-semibold hover:text-blue-400 transition-colors leading-snug mb-2"
          >
            {article.title}
          </a>

          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <span className="font-medium text-gray-300">
              {article.source?.name}
            </span>
            <span>&middot;</span>
            <time dateTime={article.publishedAt}>{new Date(article.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" })}</time>
          </div>

          {article.description && (
            <p className="text-sm text-gray-400 line-clamp-3 mt-auto">
              {article.description}
            </p>
          )}
        </article>
      ))}
    </div>
  );
}
