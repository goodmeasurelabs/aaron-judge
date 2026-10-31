import { getJudgeStats, getJudgeCareerStats, getNextGame, YANKEES_ID } from "@/lib/mlb";
import { formatDate, formatTime } from "@/lib/utils";
import NextGameStrip from "@/components/NextGameStrip";

export const metadata = {
  title: "Aaron Judge Stats — Season & Career Statistics",
  description:
    "Aaron Judge stats updated live. View Aaron Judge home runs, Aaron Judge batting average, OPS, RBI, and full career statistics for the Yankees captain.",
  keywords: [
    "aaron judge stats",
    "aaron judge home runs",
    "aaron judge batting average",
    "aaron judge rbi",
    "aaron judge ops",
    "judge stats 2026",
  ],
};

export const revalidate = 300;

const STAT_FIELDS = [
  { key: "homeRuns", label: "HR" },
  { key: "avg", label: "AVG" },
  { key: "rbi", label: "RBI" },
  { key: "ops", label: "OPS" },
  { key: "obp", label: "OBP" },
  { key: "slg", label: "SLG" },
  { key: "runs", label: "Runs" },
  { key: "hits", label: "Hits" },
  { key: "doubles", label: "Doubles" },
  { key: "baseOnBalls", label: "Walks" },
  { key: "strikeOuts", label: "Strikeouts" },
  { key: "stolenBases", label: "SB" },
  { key: "gamesPlayed", label: "Games" },
];

function StatGrid({ stats, fields }) {
  if (!stats) {
    return (
      <p className="text-gray-400 text-center py-8">
        Stats are currently unavailable.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {fields.map(({ key, label }) => (
        <div key={key} className="stat-card">
          <p className="text-gray-400 text-sm font-body uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-3xl md:text-4xl font-display font-bold text-white">
            {stats[key] ?? "—"}
          </p>
        </div>
      ))}
    </div>
  );
}

export default async function StatsPage() {
  const [seasonData, careerStats, nextGame] = await Promise.all([
    getJudgeStats(),
    getJudgeCareerStats(),
    getNextGame().catch(() => null),
  ]);

  // Format on the server so the client strip doesn't hit a hydration mismatch
  let nextGameInfo = null;
  if (nextGame) {
    const isAway = nextGame.teams.away.team.id === YANKEES_ID;
    nextGameInfo = {
      isAway,
      opponent: isAway
        ? nextGame.teams.home.team.name
        : nextGame.teams.away.team.name,
      date: formatDate(nextGame.gameDate),
      time: formatTime(nextGame.gameDate),
    };
  }

  const currentYear = new Date().getFullYear();
  const season = seasonData?.season;
  const seasonStats = seasonData?.stats;
  const isFallback = season && season < currentYear;

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative bg-navy-900 py-16 md:py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900 to-gray-950 opacity-80" />
        <div className="relative max-w-6xl mx-auto px-4 text-center">
          <h1 className="section-heading text-4xl md:text-6xl mb-4">
            Aaron Judge Stats
          </h1>
          <p className="text-xl text-gray-300 font-body">
            {season} Season &amp; Career Statistics
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 pt-6">
        <NextGameStrip game={nextGameInfo} />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12 space-y-16">
        {/* Season Stats */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-heading text-2xl md:text-3xl">
              {season} Season
            </h2>
            {isFallback && (
              <span className="text-sm text-yellow-400 font-body bg-yellow-400/10 px-3 py-1 rounded-full">
                Showing {season} — {currentYear} data not yet available
              </span>
            )}
          </div>
          <StatGrid stats={seasonStats} fields={STAT_FIELDS} />
        </section>

        {/* Career Stats */}
        <section>
          <h2 className="section-heading text-2xl md:text-3xl mb-8">
            Career Totals
          </h2>
          <StatGrid stats={careerStats} fields={STAT_FIELDS} />
        </section>

        {/* Source Note */}
        <p className="text-center text-gray-500 text-sm font-body">
          Stats sourced from MLB. Updated every 5 minutes during the season.
          {isFallback && (
            <span>
              {" "}
              Displaying {season} season stats as a fallback until {currentYear}{" "}
              data becomes available.
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
