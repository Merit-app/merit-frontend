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
export function OrgCover({ name, coverUrl, sizes, initialSize = 'lg' }: Props) {
  if (coverUrl) {
    return <Image src={coverUrl} alt="" fill className="object-cover" sizes={sizes ?? '100vw'} />;
  }

  const initial = getOrgInitials(name)[0] ?? '?';

  return (
    <div className="absolute inset-0 overflow-hidden bg-muted">
      {/* Soft neutral depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent" />
      {/* Abstract translucent shapes */}
      <div className="absolute -top-12 -right-10 w-48 h-48 rounded-full bg-foreground/[0.04]" />
      <div className="absolute -bottom-16 -left-8 w-56 h-56 rounded-full bg-foreground/[0.05]" />
      <div className="absolute top-3 left-1/4 w-28 h-28 rounded-full border border-foreground/[0.06]" />
      {/* Faint corner initial */}
      <span
        className={
          'absolute bottom-0 right-3 translate-y-1 text-foreground/[0.07] font-black leading-none select-none ' +
          (initialSize === 'sm' ? 'text-5xl' : 'text-7xl')
        }
      >
        {initial}
      </span>
    </div>
  );
}
