import Link from "next/link";
import Image from "next/image";
import AboutQuickLinks from "@/components/AboutQuickLinks";

export const metadata = {
  title: "About Aaron Judge — The Yankees Captain",
  description:
    "Learn about Aaron Judge, captain of the New York Yankees. From Linden, California to Fresno State to breaking Roger Maris's AL home run record with 62 home runs in 2022. Career stats, bio, highlights, and more.",
  keywords: [
    "aaron judge bio",
    "aaron judge about",
    "aaron judge career",
    "aaron judge yankees captain",
    "aaron judge rookie of the year",
    "aaron judge 62 home runs",
    "aaron judge fresno state",
    "aaron judge draft",
  ],
};

const highlights = [
  {
    year: "2017",
    title: "AL Rookie of the Year",
    description:
      "Burst onto the scene with 52 home runs, setting the MLB rookie record and earning unanimous AL Rookie of the Year honors.",
  },
  {
    year: "2022",
    title: "AL MVP — 62 Home Runs",
    description:
      "Shattered Roger Maris's American League single-season home run record of 61, set in 1961, by launching 62 home runs en route to a unanimous AL MVP award.",
  },
  {
    year: "2023",
    title: "Named Yankees Captain",
    description:
      "Became the 16th captain in New York Yankees franchise history, joining legends like Derek Jeter, Don Mattingly, Thurman Munson, and Lou Gehrig.",
  },
  {
    year: "2025",
    title: "World Series Champion",
    description:
      "Led the Yankees to a World Series title, cementing his legacy among the all-time Bronx greats.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-navy-900 to-gray-950" />
        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <h1 className="font-display text-5xl md:text-7xl font-bold uppercase tracking-wide text-white mb-4">
            About Aaron Judge
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 font-body">
            The Captain &nbsp;|&nbsp; #99
          </p>
        </div>
      </section>

      {/* Quick links */}
      <AboutQuickLinks />

      {/* Bio */}
      <section className="max-w-5xl mx-auto px-4 py-16 space-y-10">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="section-heading mb-6">The Man Behind the Record</h2>
            <div className="space-y-4 text-gray-300 font-body leading-relaxed">
              <p>
                Aaron James Judge was born on April 26, 1992, in Linden,
                California. Adopted the day after his birth by Patty and Wayne
                Judge, he grew up in the Central Valley and became a
                multi-sport standout at Linden High School.
              </p>
              <p>
                Judge attended Fresno State University, where he played three
                seasons for the Bulldogs and developed into one of the top
                college prospects in the country. In 2013, the New York Yankees
                selected him in the first round of the MLB Draft with the 32nd
                overall pick.
              </p>
              <p>
                After rising through the Yankees&apos; minor league system, Judge
                made his MLB debut on August 13, 2016, homering in his first
                career at-bat. The rest, as they say, is history.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/5] rounded-xl overflow-hidden">
            <Image
              src="/images/judge-hr.png"
              alt="Aaron Judge hitting a home run"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Career Highlights */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="section-heading text-center mb-12">
          Career Highlights
        </h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {highlights.map((item) => (
            <div key={item.year} className="glass rounded-xl p-6 space-y-3">
              <span className="inline-block bg-blue-600/30 text-blue-300 text-sm font-semibold px-3 py-1 rounded-full">
                {item.year}
              </span>
              <h3 className="font-display text-xl font-bold uppercase tracking-wide text-white">
                {item.title}
              </h3>
              <p className="text-gray-400 font-body leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Physical Stats + Image */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div className="relative aspect-[4/5] rounded-xl overflow-hidden order-2 md:order-1">
            <Image
              src="/images/judge-fielding.png"
              alt="Aaron Judge fielding in right field"
              fill
              className="object-cover"
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="section-heading mb-6">Built Different</h2>
            <p className="text-gray-300 font-body leading-relaxed mb-8">
              Standing at <strong className="text-white">6&apos;7&quot;</strong>{" "}
              and weighing{" "}
              <strong className="text-white">282 lbs</strong>, Aaron Judge is
              one of the largest position players in Major League Baseball
              history. His combination of towering size, elite bat speed, and
              surprising athleticism in right field makes him a truly
              once-in-a-generation talent.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="stat-card">
                <p className="text-2xl font-display font-bold text-white">
                  6&apos;7&quot;
                </p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">
                  Height
                </p>
              </div>
              <div className="stat-card">
                <p className="text-2xl font-display font-bold text-white">
                  282
                </p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">
                  Weight (lbs)
                </p>
              </div>
              <div className="stat-card">
                <p className="text-2xl font-display font-bold text-white">
                  RF
                </p>
                <p className="text-xs text-gray-400 uppercase tracking-wider mt-1">
                  Position
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="glass rounded-2xl p-10">
          <svg
            className="w-10 h-10 text-blue-400 mx-auto mb-4 opacity-60"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M11.3 2.6C6.1 4.4 2.6 9 2.6 14.3c0 3 1.4 5.1 3.6 5.1 1.9 0 3.4-1.4 3.4-3.2 0-1.8-1.3-3.1-3-3.2 .2-3.3 2.6-6.4 5.7-7.8L11.3 2.6zm10 0c-5.2 1.8-8.7 6.4-8.7 11.7 0 3 1.4 5.1 3.6 5.1 1.9 0 3.4-1.4 3.4-3.2 0-1.8-1.3-3.1-3-3.2 .2-3.3 2.6-6.4 5.7-7.8L21.3 2.6z" />
          </svg>
          <blockquote className="text-xl md:text-2xl text-gray-200 font-body italic leading-relaxed">
            &ldquo;I want to be the best. I want to be someone the next
            generation can look up to, just like I looked up to guys before
            me.&rdquo;
          </blockquote>
          <p className="mt-4 text-gray-400 font-display uppercase tracking-wider text-sm">
            — Aaron Judge
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 pb-20 text-center">
        <Link href="/stats" className="btn-primary inline-block text-lg">
          View Full Career Stats &rarr;
        </Link>
      </section>
    </div>
  );
}
