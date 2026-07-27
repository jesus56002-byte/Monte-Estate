import { readdirSync, readFileSync } from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type BlogPostMeta = {
  slug: string;
  title: string;
  description: string;
  /** ISO date string, e.g. "2026-08-01". */
  date: string;
};

type PostFrontmatter = {
  title?: string;
  description?: string;
  date?: string;
  /** Set draft: true in frontmatter to keep a post out of the site entirely until it's ready. */
  draft?: boolean;
};

function readPostFile(dir: string, filename: string): { slug: string; frontmatter: PostFrontmatter; content: string } {
  const slug = filename.replace(/\.md$/, "");
  const raw = readFileSync(path.join(dir, filename), "utf-8");
  const { data, content } = matter(raw);
  return { slug, frontmatter: data as PostFrontmatter, content };
}

/**
 * All published posts (frontmatter only), newest first. Missing content/blog
 * directory yields an empty list. `dir` defaults to content/blog and only
 * exists as a parameter so tests can point at a throwaway fixture directory
 * instead of mocking fs or touching real post files.
 */
export function getAllPosts(dir: string = BLOG_DIR): BlogPostMeta[] {
  let filenames: string[];
  try {
    filenames = readdirSync(dir).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }

  return filenames
    .map((filename) => readPostFile(dir, filename))
    .filter((post) => !post.frontmatter.draft)
    .map((post) => ({
      slug: post.slug,
      title: post.frontmatter.title ?? post.slug,
      description: post.frontmatter.description ?? "",
      date: post.frontmatter.date ?? "",
    }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** A single published post's metadata plus its body rendered to HTML. Returns null for drafts or missing slugs. */
export function getPostBySlug(slug: string, dir: string = BLOG_DIR): (BlogPostMeta & { contentHtml: string }) | null {
  let post: ReturnType<typeof readPostFile>;
  try {
    post = readPostFile(dir, `${slug}.md`);
  } catch {
    return null;
  }
  if (post.frontmatter.draft) return null;

  return {
    slug: post.slug,
    title: post.frontmatter.title ?? post.slug,
    description: post.frontmatter.description ?? "",
    date: post.frontmatter.date ?? "",
    contentHtml: marked.parse(post.content, { async: false }),
  };
}
