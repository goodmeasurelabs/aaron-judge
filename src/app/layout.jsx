import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import DataDiveFeedback from "@/components/DataDiveFeedback";

export const metadata = {
  title: {
    default: "Aaron Judge — Yankees Captain, Stats, Schedule & News | AaronJudge.net",
    template: "%s | AaronJudge.net",
  },
  description:
    "The ultimate fan hub for Aaron Judge. Live stats, game schedule, news, and more for the New York Yankees captain and AL home run record holder.",
  keywords: [
    "aaron judge",
    "aaron judge stats",
    "aaron judge home runs",
    "aaron judge next game",
    "aaron judge captain",
    "aaron judge home run record",
    "yankees captain",
    "new york yankees",
    "aaron judge schedule",
  ],
  metadataBase: new URL("https://aaronjudge.net"),
  openGraph: {
    title: "Aaron Judge — Yankees Captain | AaronJudge.net",
    description:
      "Live stats, game schedule, news, and fan content for Aaron Judge, captain of the New York Yankees.",
    url: "https://aaronjudge.net",
    siteName: "AaronJudge.net",
    type: "website",
    images: [{ url: "/social-card", width: 1200, height: 630, alt: "AaronJudge.net — unofficial fan site, original baseball artwork" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/social-card"],
    title: "Aaron Judge — Yankees Captain | AaronJudge.net",
    description:
      "Live stats, game schedule, news, and fan content for Aaron Judge.",
  },
  icons: {
    icon: "/images/yankee-icon.png",
  },
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Aaron Judge",
  jobTitle: "Professional Baseball Player",
  affiliation: {
    "@type": "SportsTeam",
    name: "New York Yankees",
    sport: "Baseball",
    memberOf: {
      "@type": "SportsOrganization",
      name: "Major League Baseball",
    },
  },
  description:
    "Aaron Judge is the captain of the New York Yankees and holds the American League single-season home run record with 62 home runs in 2022. He was named AL MVP in 2022.",
  url: "https://aaronjudge.net",
  sameAs: [
    "https://www.mlb.com/player/aaron-judge-592450",
    "https://en.wikipedia.org/wiki/Aaron_Judge",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
        <GoogleAnalytics />
      </head>
      <body className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">{children}</main>
        <Footer />
        <DataDiveFeedback siteSlug="aaron-judge" accentColor="#1e40af" />
      </body>
    </html>
  );
}
