import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { getAllPosts, getPostBySlug } from "./blog";

// Uses a real throwaway temp directory (never the real content/blog) so
// these tests exercise actual file reads instead of fighting this project's
// Vite/Vitest module resolution to mock "fs" for a module other than the
// test file itself.
let dir: string;

beforeEach(() => {
  dir = mkdtempSync(path.join(tmpdir(), "blog-test-"));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

function writePost(slug: string, frontmatter: Record<string, unknown>, body: string) {
  const yaml = Object.entries(frontmatter)
    .map(([key, value]) => `${key}: ${typeof value === "string" ? `"${value}"` : value}`)
    .join("\n");
  writeFileSync(path.join(dir, `${slug}.md`), `---\n${yaml}\n---\n\n${body}\n`);
}

describe("lib/blog", () => {
  it("returns an empty list when the directory doesn't exist", () => {
    expect(getAllPosts(path.join(dir, "does-not-exist"))).toEqual([]);
  });

  it("parses frontmatter and renders markdown to HTML", () => {
    writePost("hello-world", { title: "Hello World", description: "A test post.", date: "2026-01-15" }, "**bold** text");

    const post = getPostBySlug("hello-world", dir);
    expect(post).not.toBeNull();
    expect(post?.title).toBe("Hello World");
    expect(post?.description).toBe("A test post.");
    expect(post?.date).toBe("2026-01-15");
    expect(post?.contentHtml).toContain("<strong>bold</strong>");
  });

  it("sorts posts newest first", () => {
    writePost("older", { title: "Older", description: "", date: "2026-01-01" }, "content");
    writePost("newer", { title: "Newer", description: "", date: "2026-06-01" }, "content");

    const posts = getAllPosts(dir);
    expect(posts.map((p) => p.slug)).toEqual(["newer", "older"]);
  });

  it("excludes drafts from the list and from direct lookup", () => {
    writePost("draft-post", { title: "Draft", description: "", date: "2026-01-01", draft: true }, "content");
    writePost("published-post", { title: "Published", description: "", date: "2026-01-02" }, "content");

    expect(getAllPosts(dir).map((p) => p.slug)).toEqual(["published-post"]);
    expect(getPostBySlug("draft-post", dir)).toBeNull();
    expect(getPostBySlug("published-post", dir)).not.toBeNull();
  });

  it("returns null for a slug that doesn't exist", () => {
    expect(getPostBySlug("does-not-exist", dir)).toBeNull();
  });
});
