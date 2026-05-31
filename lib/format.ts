import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d, yyyy');
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatHours(hours: number): string {
  if (hours === 0) return '0 hrs';
  const display = hours % 1 === 0 ? String(hours) : hours.toFixed(1);
  return `${display} ${hours === 1 ? 'hr' : 'hrs'}`;
}
