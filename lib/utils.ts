import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

// ─── shadcn utility ──────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Number formatting ────────────────────────────────────────────────────────

/** Formats hours as "4 hrs", "3.5 hrs", "0.5 hrs" */
export function formatHours(hours: number): string {
  const formatted = hours % 1 === 0 ? hours.toString() : hours.toFixed(1);
  return `${formatted} hrs`;
}

/** Formats a percentage as "92%" */
export function formatPercent(value: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

// ─── Date formatting ──────────────────────────────────────────────────────────

/** Returns "Today", "Yesterday", or "Jun 14" / "Jun 14, 2024" */
export function formatSessionDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  const currentYear = new Date().getFullYear();
  const dateYear = date.getFullYear();
  if (dateYear === currentYear) return format(date, 'MMM d');
  return format(date, 'MMM d, yyyy');
}

/** Returns "3 min ago", "2 hours ago", "Yesterday at 2:14 PM" */
export function formatRelativeTime(isoString: string): string {
  const date = parseISO(isoString);
  if (isYesterday(date)) return `Yesterday at ${format(date, 'h:mm a')}`;
  if (isToday(date)) return formatDistanceToNow(date, { addSuffix: true });
  return formatDistanceToNow(date, { addSuffix: true });
}

/** Returns "Sep 3, 2024" */
export function formatLongDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy');
}

/** Returns "Jun 14" */
export function formatShortDate(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d');
}

/** Returns "2024–25" school year label from a start date */
export function formatSchoolYear(startDateStr: string): string {
  const year = parseISO(startDateStr).getFullYear();
  return `${year}–${String(year + 1).slice(2)}`;
}

// ─── Greeting copy ────────────────────────────────────────────────────────────

/** Map DB-stored goal_program values to user-facing display names */
export const GOAL_PROGRAM_DISPLAY: Record<string, string> = {
  NHS: 'NHS',
  IB: 'IB CAS',
  graduation: 'Graduation',
  scholarship: 'Scholarship',
  personal: 'Personal',
  other: 'Other',
};

/** Returns null when no goal is set (caller should show a setup link instead). */
export function getDynamicGreeting(
  totalHours: number,
  goalHours: number,
  lastSessionDate: string | null,
  weekHours: number,
  prevWeekHours: number,
  goalProgram?: string | null,
): string | null {
  // No goal configured yet — signal caller to show the setup link
  if (!goalHours) return null;

  const programLabel = goalProgram
    ? (GOAL_PROGRAM_DISPLAY[goalProgram] ?? goalProgram)
    : 'service';

  const remaining = goalHours - totalHours;
  const percent = Math.round((totalHours / goalHours) * 100);

  if (remaining <= 0) {
    return `You've hit your ${programLabel} goal. Time to think about what's next.`;
  }

  if (remaining <= 20) {
    return `You're ${percent}% of the way to your ${programLabel} goal. ${formatHours(remaining)} to go.`;
  }

  if (lastSessionDate) {
    const daysSinceLast = Math.floor(
      (Date.now() - parseISO(lastSessionDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceLast > 14) {
      return `It's been ${daysSinceLast} days since your last session. Time to get back out there.`;
    }
  }

  if (weekHours > 0) {
    const delta = weekHours - prevWeekHours;
    if (delta > 0) {
      return `You logged ${formatHours(weekHours)} this week. Nice consistency.`;
    }
    return `You logged ${formatHours(weekHours)} this week. Keep it up.`;
  }

  return `You're ${percent}% of the way to your ${programLabel} goal. ${formatHours(remaining)} to go.`;
}

// ─── Slug helpers ─────────────────────────────────────────────────────────────

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── Phone formatting ─────────────────────────────────────────────────────────

export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return raw;
}
