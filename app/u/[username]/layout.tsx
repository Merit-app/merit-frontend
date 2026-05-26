import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://getmerit.app';
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;

  let name = username;
  let bio: string | null = null;

  try {
    const res = await fetch(`${API_URL}/profiles/${encodeURIComponent(username)}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      const profile = json?.data?.profile;
      if (profile && !profile.isPrivate) {
        name = profile.name ?? username;
        bio = profile.bio ?? null;
      }
    }
  } catch {
    // fall through to defaults
  }

  const title = `${name} — Merit`;
  const description =
    bio ?? `View ${name}'s volunteer hours and badges on Merit.`;
  const ogImage = `${BASE_URL}/api/og/profile/${encodeURIComponent(username)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/u/${username}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    alternates: {
      canonical: `${BASE_URL}/u/${username}`,
    },
  };
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
