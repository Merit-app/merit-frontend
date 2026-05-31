export const siteConfig = {
  name: 'Merit',
  domain: 'https://meritco.app',
  tagline: 'Track volunteer hours. Get verified. Export a signed PDF.',
  description:
    'Merit is the easiest way for students to track volunteer hours, ' +
    'get supervisor verification by SMS, and export a signed PDF for ' +
    'NHS, IB CAS, college applications, and graduation requirements.',
  keywords: [
    'volunteer hour tracker',
    'student volunteer hours',
    'NHS volunteer hours app',
    'IB CAS hours tracker',
    'volunteer log PDF',
    'supervisor verification',
    'community service hours',
    'volunteer hour certificate',
    'track service hours',
    'volunteer hours for college',
  ],
  twitter: '@meritcoapp',
  locale: 'en_CA',
}

export function buildMetadata({
  title,
  description,
  path = '',
  image,
  noIndex = false,
}: {
  title?: string
  description?: string
  path?: string
  image?: string
  noIndex?: boolean
}) {
  const fullTitle = title
    ? `${title} — Merit`
    : 'Merit — Student Volunteer Hour Tracker'

  const fullDescription = description ?? siteConfig.description
  const url = `${siteConfig.domain}${path}`
  const ogImage = image ?? `${siteConfig.domain}/api/og`

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: siteConfig.keywords.join(', '),
    authors: [{ name: 'Merit', url: siteConfig.domain }],
    creator: 'Merit',
    metadataBase: new URL(siteConfig.domain),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: 'website' as const,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: fullTitle,
      description: fullDescription,
      images: [ogImage],
      creator: siteConfig.twitter,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large' as const,
            'max-snippet': -1,
          },
        },
  }
}
