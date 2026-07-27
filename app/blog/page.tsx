import Link from "next/link";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Footer } from "@/components/marketing/Footer";
import { getAllPosts } from "@/lib/blog";
import { formatFullDate } from "@/lib/utils/format";

const TITLE = "Blog";
const DESCRIPTION = "Real estate investing education: cash flow, cap rate, risk analysis, and Monte Carlo simulation explained.";

// While there are no posts yet, this page has nothing but placeholder text —
// genuinely thin content, so Google is right to flag it (shows up in Search
// Console as a "Soft 404"). Telling it not to index an empty listing is the
// correct move, not a workaround; the moment a real post exists this
// switches back to indexable on its own, no manual toggle needed.
export function generateMetadata(): Metadata {
  const hasPosts = getAllPosts().length > 0;

  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: "/blog" },
    openGraph: { title: `${TITLE} — Monte Estate`, description: DESCRIPTION, url: "https://monte.estate/blog" },
    twitter: { title: `${TITLE} — Monte Estate`, description: DESCRIPTION },
    robots: hasPosts ? undefined : { index: false, follow: true },
  };
}

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="flex flex-1 flex-col">
      <MarketingHeader />

      <main className="flex flex-1 flex-col">
        <section className="px-6 py-20">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Blog</h1>
            <p className="max-w-xl text-lg text-muted-foreground">
              Real estate investing education — cash flow, risk, and how to actually evaluate a deal.
            </p>
          </div>
        </section>

        <section className="border-t bg-card/40 px-6 py-20">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
            {posts.length === 0 ? (
              <p className="text-center text-muted-foreground">No posts yet — check back soon.</p>
            ) : (
              posts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group rounded-2xl border bg-card p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-soft-lg"
                >
                  <p className="text-xs text-muted-foreground">{formatFullDate(post.date)}</p>
                  <h2 className="mt-1 text-lg font-semibold group-hover:text-primary">{post.title}</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{post.description}</p>
                </Link>
              ))
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
