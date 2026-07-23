import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated app pages have nothing to offer a search index, and
      // indexing /admin specifically would be a bad look regardless of the
      // auth gate in front of it.
      disallow: ["/admin", "/deals", "/search", "/settings", "/api", "/auth"],
    },
    sitemap: "https://monte.estate/sitemap.xml",
  };
}
