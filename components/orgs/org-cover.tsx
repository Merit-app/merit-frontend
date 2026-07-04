import Image from 'next/image';

export function getOrgInitials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

interface Props {
  name: string;
  coverUrl?: string | null;
  /** Passed to next/image when a real cover exists. */
  sizes?: string;
  /** Scale the faint corner initial — 'sm' for small cards, 'lg' for hero headers. */
  initialSize?: 'sm' | 'lg';
}

/**
 * Org cover fill layer. Renders the org's uploaded cover image when present,
 * otherwise a neutral, theme-aware default banner (LinkedIn-style) so orgs that
 * haven't set up their own banner still look intentional. Must be placed inside
 * a `relative` container with a fixed height.
 */
/** Deterministic soft brand-gradient so an org with no cover still looks designed
 *  (not empty grey). Semi-transparent so it reads correctly in light AND dark. */
const COVER_GRADS = [
  'linear-gradient(135deg, rgba(37,99,235,0.24), rgba(99,102,241,0.10))',  // blue → indigo
  'linear-gradient(135deg, rgba(124,58,237,0.22), rgba(37,99,235,0.10))',  // violet → blue
  'linear-gradient(135deg, rgba(14,165,233,0.22), rgba(6,182,212,0.10))',  // sky → cyan
  'linear-gradient(135deg, rgba(16,185,129,0.20), rgba(59,130,246,0.10))', // emerald → blue
  'linear-gradient(135deg, rgba(244,63,94,0.18), rgba(168,85,247,0.10))',  // rose → purple
  'linear-gradient(135deg, rgba(245,158,11,0.18), rgba(244,63,94,0.10))',  // amber → rose
];
function coverGrad(name: string) {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0x7fffffff;
  return COVER_GRADS[h % COVER_GRADS.length];
}

export function OrgCover({ name, coverUrl, sizes, initialSize = 'lg' }: Props) {
  if (coverUrl) {
    return <Image src={coverUrl} alt="" fill className="object-cover" sizes={sizes ?? '100vw'} />;
  }

  const initial = getOrgInitials(name)[0] ?? '?';

  return (
    <div className="absolute inset-0 overflow-hidden bg-muted">
      {/* Deterministic soft brand gradient */}
      <div className="absolute inset-0" style={{ backgroundImage: coverGrad(name) }} />
      {/* Abstract translucent shapes for depth */}
      <div className="absolute -top-12 -right-10 h-48 w-48 rounded-full bg-white/[0.06] dark:bg-white/[0.04]" />
      <div className="absolute -bottom-16 -left-8 h-56 w-56 rounded-full bg-white/[0.05] dark:bg-white/[0.03]" />
      <div className="absolute top-3 left-1/4 h-28 w-28 rounded-full border border-white/10" />
      {/* Faint corner initial */}
      <span
        className={
          'absolute bottom-0 right-3 translate-y-1 font-black leading-none text-foreground/10 select-none ' +
          (initialSize === 'sm' ? 'text-5xl' : 'text-7xl')
        }
      >
        {initial}
      </span>
    </div>
  );
}
