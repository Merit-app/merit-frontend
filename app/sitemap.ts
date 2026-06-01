import type { MetadataRoute } from 'next';

const BASE_URL = 'https://meritco.app';
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');

async function getPublicProfiles(): Promise<{ username: string; updatedAt: string }[]> {
  try {
    const res = await fetch(`${API_URL}/profiles/sitemap`, {
      next: { revalidate: 3600 }, // refresh hourly
      signal: AbortSignal.timeout(5000), // 5-second timeout — never hang a build
    });
    if (!res.ok) return [];
    const json = await res.json();
    // Filter out any rows with null/empty usernames
    return (json?.data ?? []).filter((u: any) => u?.username);
  } catch {
    // Endpoint down or timed out — sitemap still generates with static pages
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: new Date(),
      changeFrequency: 'never',
      priority: 0.7,
    },
  ];

  // Fetch public profile pages
  const profiles = await getPublicProfiles();
  const profilePages: MetadataRoute.Sitemap = profiles.map(({ username, updatedAt }) => ({
    url: `${BASE_URL}/u/${encodeURIComponent(username)}`,
    lastModified: updatedAt ? new Date(updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticPages, ...profilePages];
}
