import { ImageResponse } from 'next/og';
import type { NextRequest } from 'next/server';

export const runtime = 'edge';

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params;

  let name = username;
  let school: string | null = null;
  let verifiedHours = 0;
  let badgeCount = 0;

  try {
    const res = await fetch(`${API_URL}/profiles/${encodeURIComponent(username)}`);
    if (res.ok) {
      const json = await res.json();
      const p = json?.data?.profile;
      if (p && !p.isPrivate) {
        name = p.name ?? username;
        school = p.school ?? null;
        verifiedHours = p.verifiedHours ?? 0;
        badgeCount = p.badgeCount ?? 0;
      }
    }
  } catch {
    // use defaults
  }

  const hoursDisplay =
    verifiedHours % 1 === 0 ? String(verifiedHours) : verifiedHours.toFixed(1);

  const initials = name
    .split(' ')
    .map((p: string) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '1200px',
          height: '630px',
          background: '#F8FAFC',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            background: '#FFFFFF',
            borderRadius: '24px',
            padding: '60px',
            width: '900px',
            boxShadow: '0 4px 40px rgba(0,0,0,0.08)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px', marginBottom: '40px' }}>
            {/* Avatar */}
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: '#DBEAFE',
                color: '#1D4ED8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '36px',
                fontWeight: 700,
              }}
            >
              {initials}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '36px', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                {name}
              </span>
              <span style={{ fontSize: '20px', color: '#64748B', marginTop: '4px' }}>
                @{username}
              </span>
              {school && (
                <span style={{ fontSize: '18px', color: '#94A3B8', marginTop: '2px' }}>
                  {school}
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '24px' }}>
            <div
              style={{
                flex: 1,
                background: '#F1F5F9',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '40px', fontWeight: 800, color: '#1E40AF' }}>
                {hoursDisplay}
              </span>
              <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Verified Hours
              </span>
            </div>
            <div
              style={{
                flex: 1,
                background: '#F1F5F9',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: '40px', fontWeight: 800, color: '#1E40AF' }}>
                {badgeCount}
              </span>
              <span style={{ fontSize: '14px', color: '#64748B', fontWeight: 600, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Badges
              </span>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: '#3B82F6' }}>
              getmerit.app
            </span>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
