"use client";

import Link from "next/link";
import { trackNavigationClick } from "@/lib/analytics";

const QUICK_LINKS = [
  {
    href: "/stats",
    title: "See this season's stats",
    description: "Season and career numbers, updated throughout the year.",
  },
  {
    href: "/schedule",
    title: "Find the next Yankees game",
    description: "See when and where the Yankees play next.",
  },
  {
    href: "/games",
    title: "Play the Judge trivia game",
    description: "Test how well you really know the Captain.",
  },
];

export default function AboutQuickLinks() {
  return (
    <div className="mt-10 text-left">
      <div className="grid sm:grid-cols-3 gap-4">
        {QUICK_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => trackNavigationClick({ destination: item.href, nav_location: 'about_quicklinks' })}
            className="glass rounded-xl p-5 block hover:bg-white/10 transition-colors"
          >
            <h2 className="font-display text-lg font-bold uppercase tracking-wide text-white">
              {item.title} &rarr;
            </h2>
            <p className="text-gray-400 font-body text-sm mt-1">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
