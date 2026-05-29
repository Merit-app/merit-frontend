import { NextResponse } from 'next/server';

/**
 * GET /auth/callback
 *
 * Handles redirects from Supabase email flows (password reset, email confirmation).
 * Supabase appends ?code=<pkce_code>&type=<flow_type> to the redirectTo URL.
 *
 * - type=recovery  → sends user to /reset-password with the code as `token`
 * - type=signup    → email confirmed; send to /dashboard
 * - anything else  → send to /dashboard
 *
 * The code/token is passed through to the relevant page as a query param so
 * the backend can consume it (POST /auth/reset-password, POST /auth/confirm-email).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code       = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type       = searchParams.get('type');
  const token      = code ?? token_hash ?? null;

  // Password-reset flow — pass token to /reset-password so the form can submit it
  if (type === 'recovery' && token) {
    return NextResponse.redirect(
      new URL(`/reset-password?token=${encodeURIComponent(token)}`, origin),
    );
  }

  // Email-confirmation flow — nothing to do; user is already confirmed (email_confirm: true on signup)
  if (type === 'signup') {
    return NextResponse.redirect(new URL('/dashboard', origin));
  }

  // Fallback — send to dashboard
  return NextResponse.redirect(new URL('/dashboard', origin));
}
