export function WebAppJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Merit',
          url: 'https://meritco.app',
          description:
            'Student volunteer hour tracking app with SMS verification ' +
            'and signed PDF export.',
          applicationCategory: 'EducationApplication',
          operatingSystem: 'Web, iOS, Android',
          offers: [
            {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'CAD',
              name: 'Free Plan',
            },
            {
              '@type': 'Offer',
              price: '4.99',
              priceCurrency: 'CAD',
              name: 'Pro Plan',
            },
          ],
          creator: {
            '@type': 'Organization',
            name: 'Merit',
            url: 'https://meritco.app',
          },
        }),
      }}
    />
  )
}

export function FAQJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'How does volunteer hour verification work?',
              acceptedAnswer: {
                '@type': 'Answer',
                text:
                  'When you log a session on Merit, your supervisor ' +
                  'receives an SMS or email asking them to confirm. ' +
                  'They reply YES and your hours are instantly verified.',
              },
            },
            {
              '@type': 'Question',
              name: 'What programs does Merit support?',
              acceptedAnswer: {
                '@type': 'Answer',
                text:
                  'Merit works for any volunteer hour requirement including ' +
                  'NHS, IB CAS, graduation requirements, college applications, ' +
                  'and scholarship applications.',
              },
            },
            {
              '@type': 'Question',
              name: 'Is Merit free?',
              acceptedAnswer: {
                '@type': 'Answer',
                text:
                  'Yes. Merit is free for students with unlimited session ' +
                  'logging and SMS verification. Pro plan ($4.99/mo) adds ' +
                  'modern PDF templates and unlimited exports.',
              },
            },
            {
              '@type': 'Question',
              name: 'Can I export a signed PDF?',
              acceptedAnswer: {
                '@type': 'Answer',
                text:
                  'Yes. Merit generates a signed PDF with your verified hours, ' +
                  'a QR code for independent verification, and a signature ' +
                  'block for your supervisor or advisor.',
              },
            },
            {
              '@type': 'Question',
              name: 'Is Merit available in Canada?',
              acceptedAnswer: {
                '@type': 'Answer',
                text:
                  'Yes. Merit is built in Vancouver, BC and is available ' +
                  'to students across Canada and the United States.',
              },
            },
          ],
        }),
      }}
    />
  )
}

export function OrganizationJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Merit',
          url: 'https://meritco.app',
          logo: 'https://meritco.app/favicon.svg',
          contactPoint: {
            '@type': 'ContactPoint',
            email: 'hello@meritco.app',
            contactType: 'customer support',
          },
          sameAs: [],
        }),
      }}
    />
  )
}
