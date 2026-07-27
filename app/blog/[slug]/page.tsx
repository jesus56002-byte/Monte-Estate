import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { Footer } from "@/components/marketing/Footer";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { formatFullDate } from "@/lib/utils/format";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: `${post.title} — Monte Estate`,
      description: post.description,
      url: `https://monte.estate/blog/${post.slug}`,
      type: "article",
    },
    twitter: { title: `${post.title} — Monte Estate`, description: post.description },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: { "@type": "Organization", name: "Monte Estate" },
  };

  return (
    <div className="flex flex-1 flex-col">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <MarketingHeader />

      <main className="flex flex-1 flex-col px-6 py-16">
        <article className="mx-auto flex w-full max-w-2xl flex-col gap-8">
          <div className="flex flex-col gap-2">
            <Link href="/blog" className="text-sm text-muted-foreground hover:text-foreground">
              ← Blog
            </Link>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{post.title}</h1>
            <p className="text-sm text-muted-foreground">{formatFullDate(post.date)}</p>
          </div>
          <div
            className="prose prose-neutral dark:prose-invert max-w-none prose-headings:tracking-tight prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }}
          />
        </article>
      </main>

      <Footer />
    </div>
  );
}
