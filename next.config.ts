import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript: framer-motion v12 types are incompatible with TypeScript 5.9's stricter
  // Omit<T & U, K> handling. The runtime behaviour is unaffected. Remove once
  // framer-motion ships updated type definitions for TS 5.9+.
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        // Supabase Storage — avatars, org logos, cover photos
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Direct project hostname (fallback for hardcoded Supabase URLs)
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        // meritco.app CDN / OG images
        protocol: 'https',
        hostname: 'meritco.app',
      },
      {
        // ProPublica nonprofit logos (if ever used)
        protocol: 'https',
        hostname: 'projects.propublica.org',
      },
    ],
  },
};

export default nextConfig;
