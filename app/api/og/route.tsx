import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0F172A',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: '#FFFFFF',
            letterSpacing: '-2px',
            marginBottom: 24,
          }}
        >
          merit.
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 32,
            color: '#94A3B8',
            textAlign: 'center',
            maxWidth: 700,
            lineHeight: 1.4,
          }}
        >
          Track volunteer hours. Get verified. Export a signed PDF.
        </div>

        {/* Bottom badge */}
        <div
          style={{
            marginTop: 48,
            background: '#1E40AF',
            color: '#FFFFFF',
            fontSize: 20,
            fontWeight: 600,
            padding: '12px 32px',
            borderRadius: 12,
          }}
        >
          meritco.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
