import type { MetadataRoute } from "next";

const BASE_URL = "https://monte.estate";

export default function sitemap(): MetadataRoute.Sitemap {
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
    { url: `${BASE_URL}/login`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE_URL}/signup`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${BASE_URL}/privacy`, priority: 0.2, changeFrequency: "yearly" },
    { url: `${BASE_URL}/terms`, priority: 0.2, changeFrequency: "yearly" },
  ];
}
