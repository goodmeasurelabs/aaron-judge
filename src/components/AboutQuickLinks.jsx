"use client";

import Link from "next/link";
import { trackNavigationClick } from "@/lib/analytics";

const QUICK_LINKS = [
  {
    href: "/stats",
    title: "Live Stats",
    description: "Season and career numbers, updated throughout the year.",
  },
  {
    href: "/schedule",
    title: "Upcoming Schedule",
    description: "See when and where the Yankees play next.",
  },
  {
    href: "/games",
    title: "Trivia Game",
    description: "Test how well you really know the Captain.",
  },
];

export default function AboutQuickLinks() {
  return (
    <section className="max-w-5xl mx-auto px-4 pt-12">
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
    </section>
  );
}
