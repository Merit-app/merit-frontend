import { NextResponse } from 'next/server';

/**
 * GET /auth/confirm
 *
 * Mirror of /auth/callback — Supabase sends email confirmation links to
 * /auth/confirm in some project configurations. We handle both URLs so
 * neither 404s.
 *
 * Params appended by Supabase:
 *   ?token_hash=<hash>&type=signup   — new-user email confirmation
 *   ?code=<pkce_code>&type=recovery  — password-reset flow
 *   ?token_hash=<hash>&type=recovery — password-reset (alternative format)
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code       = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type       = searchParams.get('type');
  const token      = code ?? token_hash ?? null;

  // Password-reset flow — forward token to the reset-password page
  if (type === 'recovery' && token) {
    return NextResponse.redirect(
      new URL(`/reset-password?token=${encodeURIComponent(token)}`, origin),
    );
  }

  // Email confirmation (signup, email-change, invite, etc.)
  // Token is consumed server-side by Supabase; just send user to dashboard
  if (token_hash && type) {
    return NextResponse.redirect(new URL('/dashboard', origin));
  }

  // code-based PKCE flow (older Supabase SDK versions)
  if (code && type === 'signup') {
    return NextResponse.redirect(new URL('/dashboard', origin));
  }

  // Fallback
  return NextResponse.redirect(new URL('/dashboard', origin));
}
