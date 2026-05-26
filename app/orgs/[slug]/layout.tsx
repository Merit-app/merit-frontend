import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://getmerit.app';
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  let name = slug;
  let description: string | null = null;

  try {
    const res = await fetch(`${API_URL}/orgs/${encodeURIComponent(slug)}`, {
      next: { revalidate: 300 },
    });
    if (res.ok) {
      const json = await res.json();
      const org = json?.data?.org;
      if (org) {
        name = org.name ?? slug;
        description = org.description ?? null;
      }
    }
  } catch {
    // fall through to defaults
  }

  const title = `${name} — Merit`;
  const desc = description ?? `View ${name}'s verified volunteer hours and top volunteers on Merit.`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url: `${BASE_URL}/orgs/${slug}`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description: desc,
    },
    alternates: {
      canonical: `${BASE_URL}/orgs/${slug}`,
    },
  };
}

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
