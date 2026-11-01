import Link from "next/link";
import Image from "next/image";
import { getJudgeStats, getNextGame, getJudgeCareerStats } from "@/lib/mlb";
import { formatDate, formatTime } from "@/lib/utils";
import NewsFeed from "@/components/NewsFeed";
import HomeFeatureCards from "@/components/HomeFeatureCards";

export const revalidate = 300;

export default async function HomePage() {
  const [seasonData, nextGame, careerStats] = await Promise.all([
    getJudgeStats(),
    getNextGame(),
    getJudgeCareerStats(),
  ]);

  const stats = seasonData?.stats;
  const season = seasonData?.season;

  // Determine if Yankees are home or away for the next game
  let opponent = null;
  let isAway = false;
  if (nextGame) {
    isAway = nextGame.teams.away.team.id === 147;
    opponent = isAway
      ? nextGame.teams.home.team.name
      : nextGame.teams.away.team.name;
  }

  return (
    <main>
      {/* ===== Hero Section ===== */}
      <section
        className="relative flex flex-col items-center justify-center h-[70vh] min-h-[500px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/yankee-stadium.png')" }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900/80 via-navy-900/60 to-gray-950" />

        <div className="relative z-10 text-center px-4">
          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold uppercase tracking-wider text-white drop-shadow-lg">
            Aaron Judge
          </h1>
          <p className="mt-4 text-lg sm:text-xl md:text-2xl text-gray-300 font-body tracking-wide">
            Captain of the New York Yankees&nbsp;|&nbsp;#99
          </p>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <div className="glass mx-auto max-w-5xl rounded-t-xl px-6 py-4">
              <p className="text-center text-xs uppercase tracking-widest text-gray-400 mb-3 font-body">
                {season} Season Stats
              </p>
              <div className="flex items-center justify-around gap-4 flex-wrap">
                {[
                  { label: "HR", value: stats.homeRuns },
                  { label: "AVG", value: stats.avg },
                  { label: "RBI", value: stats.rbi },
                  { label: "OPS", value: stats.ops },
                  { label: "SLG", value: stats.slg },
                ].map(({ label, value }) => (
                  <div key={label} className="text-center min-w-[60px]">
                    <p className="font-display text-2xl md:text-3xl font-bold text-white">
                      {value}
                    </p>
                    <p className="text-xs uppercase tracking-wider text-gray-400">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ===== Feature Cards (trivia + next game) ===== */}
      <HomeFeatureCards
        nextGame={
          nextGame
            ? {
                matchup: `${isAway ? "@ " : "vs "}${opponent}`,
                date: formatDate(nextGame.gameDate),
                time: formatTime(nextGame.gameDate),
              }
            : null
        }
      />

      {/* ===== Next Game Widget ===== */}
      <section className="bg-navy-900/50 border-b border-white/5">
        <div className="max-w-5xl mx-auto px-4 py-4">
          {nextGame ? (
            <Link
              href="/schedule"
              className="flex flex-col sm:flex-row items-center justify-between gap-2 group"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-widest text-blue-400">
                  Next Game
                </span>
                <span className="text-white font-display text-lg uppercase">
                  {isAway ? "@ " : "vs "}
                  {opponent}
                </span>
              </div>
              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <span>{formatDate(nextGame.gameDate)}</span>
                <span>{formatTime(nextGame.gameDate)}</span>
                <span className="text-blue-400 group-hover:text-blue-300 transition-colors">
                  View Schedule &rarr;
                </span>
              </div>
            </Link>
          ) : (
            <p className="text-center text-gray-400 text-sm">
              No upcoming games scheduled.
            </p>
          )}
        </div>
      </section>

      {/* ===== News Section ===== */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="section-heading text-center mb-10">
          Latest Aaron Judge News
        </h2>
        <NewsFeed />
      </section>

      {/* ===== "The Captain" Section ===== */}
      <section className="bg-navy-900/30 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="section-heading text-center mb-12">The Captain</h2>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            {/* Image column */}
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <Image
                src="/images/judge-hr.png"
                alt="Aaron Judge hitting a home run"
                width={720}
                height={480}
                className="w-full h-auto object-cover"
                priority={false}
              />
            </div>

            {/* Text column */}
            <div className="space-y-5 font-body text-gray-300 leading-relaxed">
              <p className="text-lg">
                Aaron Judge is the{" "}
                <strong className="text-white">
                  captain of the New York Yankees
                </strong>
                , carrying on a legacy that includes legends like Derek Jeter,
                Thurman Munson, and Lou Gehrig. Standing 6&#8217;7&#8221; and
                wielding one of the most powerful swings in baseball history,
                Judge has redefined what it means to be a Yankee slugger.
              </p>

              <p>
                In 2022, Judge shattered Roger Maris&#8217;s 61-year-old
                American League record by launching{" "}
                <strong className="text-white">
                  62 home runs
                </strong>{" "}
                in a single season&mdash;a feat that earned him the{" "}
                <strong className="text-white">2022 AL MVP</strong> award
                unanimously. That historic campaign cemented his place among
                baseball&#8217;s all-time greats and made him the undisputed
                AL home run record holder.
              </p>

              {careerStats && (
                <p>
                  Across his career, Judge has already belted{" "}
                  <span className="font-display text-2xl text-white font-bold">
                    {careerStats.homeRuns}
                  </span>{" "}
                  home runs, a number that continues to climb with every at-bat.
                </p>
              )}

              <p>
                Named captain in 2023, Judge leads by example both on and off
                the field. His combination of power, discipline, and
                sportsmanship makes him the perfect ambassador for the
                Yankees&mdash;and a generational talent fans will remember
                forever.
              </p>

              <Link href="/about" className="btn-primary inline-block mt-2">
                Learn more about Aaron Judge
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
