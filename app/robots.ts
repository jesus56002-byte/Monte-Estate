import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated app pages have nothing to offer a search index, and
      // indexing /admin specifically would be a bad look regardless of the
      // auth gate in front of it. "/search" is deliberately not here — it's
      // now a public free-preview landing page for anonymous visitors (see
      // app/search/page.tsx); "/search/custom" stays disallowed since it's
      // still authenticated-only.
      disallow: ["/admin", "/deals", "/home", "/search/custom", "/settings", "/api", "/auth"],
    },
    sitemap: "https://monte.estate/sitemap.xml",
  };
}
