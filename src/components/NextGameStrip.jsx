"use client";

import Link from "next/link";
import { trackNavigationClick } from "@/lib/analytics";

const NAV_LOCATION = "stats_next_game_strip";

export default function NextGameStrip({ game }) {
  return (
    <div className="glass rounded-xl px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-body">
      {game && (
        <Link
          href="/schedule"
          onClick={() =>
            trackNavigationClick({ destination: "/schedule", nav_location: NAV_LOCATION })
          }
          className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 group"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
            Next Game
          </span>
          <span className="text-white font-display text-lg uppercase">
            {game.isAway ? "@ " : "vs "}
            {game.opponent}
          </span>
          <span className="text-gray-400 text-sm">
            {game.date} &middot; {game.time}
          </span>
          <span className="text-blue-400 text-sm group-hover:text-blue-300 transition-colors">
            View Schedule &rarr;
          </span>
        </Link>
      )}
      <Link
        href="/games"
        onClick={() =>
          trackNavigationClick({ destination: "/games", nav_location: NAV_LOCATION })
        }
        className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
      >
        Test your Judge knowledge: play trivia &rarr;
      </Link>
    </div>
  );
}
