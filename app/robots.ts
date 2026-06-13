import type { MetadataRoute } from 'next';

const BASE_URL = 'https://meritco.app';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Keep authenticated app surfaces, admin tooling, and the API out of
        // the index — they're private and have no SEO value.
        disallow: [
          '/dashboard',
          '/hours',
          '/log',
          '/export',
          '/settings',
          '/saved',
          '/badges',
          '/onboarding',
          '/my-chapter',
          '/chapter',
          '/org/',
          '/admin',
          '/claim',
          '/partner',
          '/invite',
          '/verify',
          '/reset-password',
          '/forgot-password',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  };
}
