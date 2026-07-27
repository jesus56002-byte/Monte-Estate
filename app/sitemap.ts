import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";

const BASE_URL = "https://monte.estate";

export default function sitemap(): MetadataRoute.Sitemap {
  // Blog posts are picked up automatically from content/blog/*.md — adding a
  // post never requires touching this file.
  const posts = getAllPosts().map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    priority: 0.6,
    changeFrequency: "yearly" as const,
  }));

  return [
    { url: BASE_URL, priority: 1, changeFrequency: "weekly" },
    { url: `${BASE_URL}/pricing`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE_URL}/how-it-works`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE_URL}/calculators`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${BASE_URL}/mortgage-calculator`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/cap-rate-calculator`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/cash-flow-calculator`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/cash-on-cash-calculator`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/irr-calculator`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${BASE_URL}/blog`, priority: 0.7, changeFrequency: "weekly" },
    ...posts,
    { url: `${BASE_URL}/login`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE_URL}/signup`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE_URL}/privacy`, priority: 0.2, changeFrequency: "yearly" },
    { url: `${BASE_URL}/terms`, priority: 0.2, changeFrequency: "yearly" },
  ];
}
