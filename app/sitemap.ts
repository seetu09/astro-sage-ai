import type { MetadataRoute } from "next";
import fs from "fs/promises";
import path from "path";

const BASE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://astro-sage-ai.vercel.app"
).replace(/\/$/, "");

type ChangeFrequency = "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";

const STATIC_ROUTES: {
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
}[] = [
  { path: "", priority: 1.0, changeFrequency: "daily" },
  { path: "/daily-horoscope", priority: 0.9, changeFrequency: "daily" },
  { path: "/kundali", priority: 0.9, changeFrequency: "weekly" },
  { path: "/matchmaking", priority: 0.8, changeFrequency: "weekly" },
  { path: "/numerology", priority: 0.8, changeFrequency: "weekly" },
  { path: "/tarot", priority: 0.8, changeFrequency: "weekly" },
  { path: "/love-meter", priority: 0.8, changeFrequency: "weekly" },
  { path: "/dosha-checker", priority: 0.8, changeFrequency: "weekly" },
  { path: "/chat", priority: 0.8, changeFrequency: "weekly" },
  { path: "/blog", priority: 0.7, changeFrequency: "weekly" },
  { path: "/store", priority: 0.7, changeFrequency: "weekly" },
  { path: "/social", priority: 0.6, changeFrequency: "weekly" },
  { path: "/about", priority: 0.5, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.5, changeFrequency: "monthly" },
  { path: "/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/disclaimer", priority: 0.3, changeFrequency: "yearly" },
];

type BlogPost = { slug: string; createdAt: string };

async function getBlogUrls(): Promise<MetadataRoute.Sitemap> {
  try {
    const postsFile = path.join(process.cwd(), "data", "posts.json");
    const posts: BlogPost[] = JSON.parse(await fs.readFile(postsFile, "utf-8"));
    return posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.createdAt ? new Date(post.createdAt) : new Date(),
      changeFrequency: "monthly" as ChangeFrequency,
      priority: 0.6,
    }));
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = STATIC_ROUTES.map((route) => ({
    url: `${BASE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  return [...staticUrls, ...(await getBlogUrls())];
}
