"use client";

import Link from "next/link";
import { trackNavigationClick } from "@/lib/analytics";

export default function HomeFeatureCards({ nextGame }) {
  return (
    <section className="max-w-5xl mx-auto px-4 pt-10">
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/games"
          onClick={() => trackNavigationClick({ destination: "/games", nav_location: "home_card_trivia" })}
          className="card p-6 group block"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-2">
            Trivia
          </p>
          <h3 className="font-display text-2xl uppercase text-white">
            Test your Judge knowledge
          </h3>
          <p className="mt-2 text-sm text-gray-400">
            Think you know the Captain? Take the quiz.
          </p>
          <span className="mt-4 inline-block text-sm text-blue-400 group-hover:text-blue-300 transition-colors">
            Play trivia &rarr;
          </span>
        </Link>

        <Link
          href="/schedule"
          onClick={() => trackNavigationClick({ destination: "/schedule", nav_location: "home_card_next_game" })}
          className="card p-6 group block"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 mb-2">
            Next game
          </p>
          {nextGame ? (
            <>
              <h3 className="font-display text-2xl uppercase text-white">
                {nextGame.matchup}
              </h3>
              <p className="mt-2 text-sm text-gray-400">
                {nextGame.date} &middot; {nextGame.time}
              </p>
            </>
          ) : (
            <h3 className="font-display text-2xl uppercase text-white">
              Yankees schedule
            </h3>
          )}
          <span className="mt-4 inline-block text-sm text-blue-400 group-hover:text-blue-300 transition-colors">
            View schedule &rarr;
          </span>
        </Link>
      </div>
    </section>
  );
}
